/**
 * URL validation utilities for security
 */

/**
 * Validates that an image URL is safe to use in <img> tags
 * Prevents XSS attacks via javascript:, data:, and file: protocols
 */
export const isValidImageUrl = (url: string | undefined): boolean => {
  if (!url) return false;
  
  try {
    const parsed = new URL(url);
    
    // Only allow HTTP/HTTPS protocols to prevent XSS
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false;
    }
    
    return true;
  } catch {
    // Invalid URL format
    return false;
  }
};

/**
 * Validates that a source URL is safe to fetch
 * Prevents SSRF attacks by blocking localhost and private IPs
 */
export const isValidSourceUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    
    // Only allow HTTP/HTTPS
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false;
    }
    
    // Block localhost and private IPs (SSRF protection)
    const hostname = parsed.hostname.toLowerCase();
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.startsWith('172.16.') ||
      hostname.startsWith('172.17.') ||
      hostname.startsWith('172.18.') ||
      hostname.startsWith('172.19.') ||
      hostname.startsWith('172.20.') ||
      hostname.startsWith('172.21.') ||
      hostname.startsWith('172.22.') ||
      hostname.startsWith('172.23.') ||
      hostname.startsWith('172.24.') ||
      hostname.startsWith('172.25.') ||
      hostname.startsWith('172.26.') ||
      hostname.startsWith('172.27.') ||
      hostname.startsWith('172.28.') ||
      hostname.startsWith('172.29.') ||
      hostname.startsWith('172.30.') ||
      hostname.startsWith('172.31.')
    ) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
};

/**
 * Allowed domains for media platforms
 */
export const ALLOWED_DOMAINS = {
  youtube: ['youtube.com', 'www.youtube.com', 'youtu.be', 'm.youtube.com'],
  spotify: ['spotify.com', 'open.spotify.com'],
  soundcloud: ['soundcloud.com', 'www.soundcloud.com'],
  bandcamp: ['bandcamp.com'], // Artist subdomains handled separately
};

/**
 * Checks if a hostname matches allowed domains for a service
 */
export const isDomainAllowed = (
  hostname: string,
  service: keyof typeof ALLOWED_DOMAINS
): boolean => {
  const allowed = ALLOWED_DOMAINS[service];
  
  // Exact match
  if (allowed.includes(hostname)) return true;
  
  // Subdomain match for bandcamp (artist.bandcamp.com)
  if (service === 'bandcamp') {
    return hostname.endsWith('.bandcamp.com');
  }
  
  // Subdomain match for other services if needed
  return allowed.some(domain => hostname === domain || hostname.endsWith(`.${domain}`));
};
