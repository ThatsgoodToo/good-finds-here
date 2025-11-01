import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// Rate limiting: Track submissions by IP
const rateLimitCache = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds
const MAX_REQUESTS = 3;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const requests = rateLimitCache.get(ip) || [];
  
  // Remove old requests outside the window
  const recentRequests = requests.filter(
    timestamp => now - timestamp < RATE_LIMIT_WINDOW
  );
  
  if (recentRequests.length >= MAX_REQUESTS) {
    console.log(`Rate limit exceeded for IP: ${ip}`);
    return false;
  }
  
  // Add current request
  recentRequests.push(now);
  rateLimitCache.set(ip, recentRequests);
  
  return true;
}

function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, "");
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }

  try {
    // Get client IP for rate limiting
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0] || 
                     req.headers.get("x-real-ip") || 
                     "unknown";

    console.log(`Contact form submission from IP: ${clientIP}`);

    // Check rate limit
    if (!checkRateLimit(clientIP)) {
      return new Response(
        JSON.stringify({ 
          error: "Too many requests. Please wait before trying again." 
        }),
        {
          status: 429,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Parse request body
    const { name, email, subject, message }: ContactFormData = await req.json();

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return new Response(
        JSON.stringify({ error: "All fields are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Validate input lengths
    if (name.length < 2 || name.length > 100) {
      return new Response(
        JSON.stringify({ error: "Name must be between 2 and 100 characters" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    if (email.length > 255 || !validateEmail(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email address" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    if (subject.length < 5 || subject.length > 200) {
      return new Response(
        JSON.stringify({ error: "Subject must be between 5 and 200 characters" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    if (message.length < 10 || message.length > 2000) {
      return new Response(
        JSON.stringify({ error: "Message must be between 10 and 2000 characters" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Sanitize inputs
    const sanitizedName = sanitizeInput(name);
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedSubject = sanitizeInput(subject);
    const sanitizedMessage = sanitizeInput(message);

    // Format email HTML
    const timestamp = new Date().toISOString();
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; border-bottom: 2px solid #0066cc; padding-bottom: 10px;">
          Contact Form Submission
        </h2>
        
        <div style="margin: 20px 0;">
          <p style="margin: 10px 0;"><strong>From:</strong> ${sanitizedName}</p>
          <p style="margin: 10px 0;"><strong>Email:</strong> ${sanitizedEmail}</p>
          <p style="margin: 10px 0;"><strong>Subject:</strong> ${sanitizedSubject}</p>
        </div>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #555;">Message:</h3>
          <p style="white-space: pre-wrap; color: #333;">${sanitizedMessage}</p>
        </div>
        
        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
          <p><strong>Timestamp:</strong> ${timestamp}</p>
          <p><strong>IP Address:</strong> ${clientIP}</p>
        </div>
      </div>
    `;

    // Send email via Resend
    console.log(`Sending contact form email for subject: ${sanitizedSubject}`);
    
    const emailResponse = await resend.emails.send({
      from: "That's Good Too <noreply@thatsgoodtoo.shop>",
      to: ["connect@thatsgoodtoo.shop"],
      replyTo: sanitizedEmail,
      subject: `Contact Form: ${sanitizedSubject}`,
      html: emailHtml,
    });

    console.log("Contact email sent successfully:", emailResponse);

    // Send confirmation email to user
    console.log(`Sending confirmation email to user: ${sanitizedEmail}`);
    
    const confirmationHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0066cc; border-bottom: 2px solid #0066cc; padding-bottom: 10px;">
          Thank You for Contacting Us!
        </h2>
        
        <div style="margin: 20px 0;">
          <p style="color: #333;">Hi ${sanitizedName},</p>
          <p style="color: #333;">
            We've received your message and will get back to you as soon as possible, 
            typically within 24 hours.
          </p>
        </div>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #555;">Your Message:</h3>
          <p style="margin: 5px 0;"><strong>Subject:</strong> ${sanitizedSubject}</p>
          <p style="white-space: pre-wrap; color: #333; margin-top: 10px;">${sanitizedMessage}</p>
        </div>
        
        <div style="margin-top: 20px; padding: 15px; background-color: #e8f4fd; border-radius: 5px;">
          <p style="margin: 0; color: #0066cc;">
            <strong>Need immediate assistance?</strong><br>
            Email us directly at: <a href="mailto:connect@thatsgoodtoo.shop" style="color: #0066cc;">connect@thatsgoodtoo.shop</a>
          </p>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
          <p>Best regards,<br><strong>That's Good Too Team</strong></p>
        </div>
      </div>
    `;

    try {
      await resend.emails.send({
        from: "That's Good Too <noreply@thatsgoodtoo.shop>",
        to: [sanitizedEmail],
        subject: "We received your message - That's Good Too",
        html: confirmationHtml,
      });
      console.log("Confirmation email sent to user");
    } catch (confirmError: any) {
      // Log but don't fail the main request if confirmation email fails
      console.error("Failed to send confirmation email:", confirmError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Your message has been sent successfully" 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Failed to send message. Please try again later or email us directly.",
        details: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
