import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  templateVars?: Record<string, string>;
}

// Generate unsubscribe URL with token
function generateUnsubscribeUrl(email: string): string {
  const token = btoa(email + Date.now()); // Simple token generation
  return `https://thatsgoodtoo.shop/unsubscribe?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;
}

// Replace dynamic variables in content
function replacePlaceholders(content: string, vars: Record<string, string>): string {
  let result = content;
  for (const [key, value] of Object.entries(vars)) {
    const regex = new RegExp(`{${key}}`, 'g');
    result = result.replace(regex, value);
  }
  return result;
}

// Wrap content in branded coupon template
function wrapInBrandedTemplate(htmlContent: string, unsubscribeUrl: string): string {
  const template = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 2px dashed #FFD700; background: #FFF8DC; border-radius: 10px;">
      <h1 style="color: #FF4500; text-align: center; margin-bottom: 20px;">
        ThatsGoodToo 💸 Save Big!
      </h1>
      <div style="padding: 20px; background: white; border-radius: 8px; margin-bottom: 20px;">
        ${htmlContent}
      </div>
      <hr style="border: 1px dashed #FFD700; margin: 20px 0;">
      <p style="text-align: center; color: #666; font-size: 14px;">
        <a href="${unsubscribeUrl}" style="background: #32CD32; color: white; padding: 8px 16px; text-decoration: none; border-radius: 5px; display: inline-block; margin-right: 10px;">Unsubscribe</a>
        <a href="https://thatsgoodtoo.shop" style="color: #FF4500; text-decoration: none;">View Deals</a>
      </p>
      <p style="text-align: center; color: #999; font-size: 12px; margin-top: 20px;">
        © ${new Date().getFullYear()} ThatsGoodToo. All rights reserved.
      </p>
    </div>
  `;
  return template;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Processing send-email request...");

    // Parse and validate request
    const emailRequest: EmailRequest = await req.json();
    const { to, subject, html, text, from, templateVars = {} } = emailRequest;

    // Validation
    if (!to || !subject || !html) {
      console.error("Missing required fields:", { to: !!to, subject: !!subject, html: !!html });
      return new Response(
        JSON.stringify({ error: "Missing required fields: to, subject, html" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      console.error("Invalid email format:", to);
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Subject length validation
    if (subject.length > 200) {
      console.error("Subject too long:", subject.length);
      return new Response(
        JSON.stringify({ error: "Subject must be less than 200 characters" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Generate unsubscribe URL
    const unsubscribeUrl = generateUnsubscribeUrl(to);
    
    // Add unsubscribe URL to template vars
    const allVars = {
      ...templateVars,
      unsubscribe_url: unsubscribeUrl,
      UNSUBSCRIBE_URL: unsubscribeUrl,
    };

    // Replace placeholders in HTML content
    let processedHtml = replacePlaceholders(html, allVars);
    
    // Wrap in branded template
    const finalHtml = wrapInBrandedTemplate(processedHtml, unsubscribeUrl);

    // Process plain text if provided
    let processedText = text ? replacePlaceholders(text, allVars) : undefined;

    // Send email via Resend
    const emailFrom = from || "That's Good Too <noreply@thatsgoodtoo.shop>";
    
    console.log(`Sending email to ${to} with subject: ${subject}`);
    
    const emailResponse = await resend.emails.send({
      from: emailFrom,
      to: [to],
      subject: subject,
      html: finalHtml,
      text: processedText,
    });

    if (emailResponse.error) {
      console.error("Resend API error:", emailResponse.error);
      return new Response(
        JSON.stringify({ 
          error: "Failed to send email", 
          details: emailResponse.error 
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Email sent successfully:", emailResponse.data);

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: emailResponse.data?.id,
        message: "Email sent successfully" 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in send-email function:", error);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error", 
        message: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
