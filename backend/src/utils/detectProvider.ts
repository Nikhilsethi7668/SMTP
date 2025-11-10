import dns from 'dns/promises';

/**
 * DNS Provider types
 */
export type DNSProvider = 'cloudflare' | 'route53' | 'google' | 'manual';

/**
 * Known nameserver patterns for provider detection
 */
const PROVIDER_PATTERNS: Record<string, DNSProvider> = {
  'cloudflare': 'cloudflare',
  'ns.cloudflare.com': 'cloudflare',
  'awsdns': 'route53',
  'route53': 'route53',
  'amazonaws.com': 'route53',
  'googledomains.com': 'google',
  'googleusercontent.com': 'google',
  'ns.google.com': 'google',
};

/**
 * Detect DNS provider from domain's authoritative nameservers
 * @param domain - The domain to check (e.g., "example.com")
 * @returns Promise resolving to detected provider name
 */
export async function detectProvider(domain: string): Promise<DNSProvider> {
  try {
    // Resolve authoritative nameservers for the domain
    const nameservers = await dns.resolveNs(domain);

    // Check each nameserver against known patterns
    for (const ns of nameservers) {
      const nsLower = ns.toLowerCase();

      for (const [pattern, provider] of Object.entries(PROVIDER_PATTERNS)) {
        if (nsLower.includes(pattern.toLowerCase())) {
          return provider;
        }
      }
    }

    // Default to manual if no known provider detected
    return 'manual';
  } catch (error: any) {
    console.error(`Error detecting provider for ${domain}:`, error.message);
    // On error, default to manual
    return 'manual';
  }
}

/**
 * Get list of nameservers for a domain (for debugging)
 * @param domain - The domain to check
 * @returns Promise resolving to array of nameserver hostnames
 */
export async function getNameservers(domain: string): Promise<string[]> {
  try {
    return await dns.resolveNs(domain);
  } catch (error: any) {
    console.error(`Error resolving nameservers for ${domain}:`, error.message);
    return [];
  }
}

