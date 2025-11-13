import { invokeLLM } from "./_core/llm";
import { makeRequest } from "./_core/map";
import * as cheerio from "cheerio";

export interface ICP {
  id: number;
  name: string;
  industry: string;
  businessType: string;
  location: string;
  employeeRange?: string;
  revenueRange?: string;
  painPoints?: string;
  targetKeywords?: string;
}

export interface ProspectingResult {
  businessName: string;
  businessType: string;
  industry: string;
  location: string;
  address?: string;
  phone?: string;
  website?: string;
  rating?: number;
  reviewCount?: number;
  placeId?: string;
  
  // Enriched data
  digitalPresenceScore?: number;
  websiteQuality?: string;
  seoScore?: string;
  socialMediaPresence?: string;
  googleBusinessProfile?: string;
  
  // AI Analysis
  painPoints?: string[];
  automationOpportunities?: string[];
  salesOpportunities?: string[];
  whyGoodFit?: string[];
  talkingPoints?: string[];
  recommendedPackage?: string;
  estimatedValue?: string;
  priority?: "high" | "medium" | "low";
  
  // Geoeconomic data
  marketSize?: string;
  competition?: string;
  demographics?: string;
}

/**
 * Search for businesses using Google Maps Places API based on ICP criteria
 */
export async function searchBusinessesByICP(
  icp: ICP,
  maxResults: number = 20
): Promise<ProspectingResult[]> {
  try {
    // Build search query from ICP
    const searchQuery = `${icp.businessType} ${icp.industry} in ${icp.location}`;
    
    // Use Google Maps Places Text Search
    const response = (await makeRequest("/maps/api/place/textsearch/json", {
      query: searchQuery,
      type: icp.businessType.toLowerCase().replace(/\s+/g, "_"),
    })) as any;

    if (!response.results || response.results.length === 0) {
      return [];
    }

    // Process results
    const prospects: ProspectingResult[] = [];
    const results = response.results.slice(0, maxResults);

    for (const place of results) {
      const prospect: ProspectingResult = {
        businessName: place.name || "Unknown",
        businessType: icp.businessType,
        industry: icp.industry,
        location: icp.location,
        address: place.formatted_address,
        rating: place.rating,
        reviewCount: place.user_ratings_total,
        placeId: place.place_id,
      };

      // Get additional details if place_id is available
      if (place.place_id) {
        try {
          const detailsResponse = await makeRequest("/maps/api/place/details/json", {
            place_id: place.place_id,
            fields: "name,formatted_phone_number,website,opening_hours,rating,user_ratings_total,reviews",
          }) as any;

          if (detailsResponse.result) {
            const details = detailsResponse.result as any;
            prospect.phone = details.formatted_phone_number;
            prospect.website = details.website;
          }
        } catch (error) {
          console.error(`Failed to get details for ${place.name}:`, error);
        }
      }

      prospects.push(prospect);
    }

    return prospects;
  } catch (error: any) {
    console.error("Failed to search businesses:", error.message);
    throw new Error("Failed to search businesses via Google Maps");
  }
}

/**
 * Scrape and analyze a company website
 */
export async function scrapeAndAnalyzeWebsite(url: string): Promise<{
  content: string;
  title: string;
  description: string;
  hasModernDesign: boolean;
  isMobileResponsive: boolean;
  loadTime: string;
  hasSEO: boolean;
  socialLinks: string[];
}> {
  try {
    // Fetch website content
    const startTime = Date.now();
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; MomentumCRM/1.0; +https://momentum.ai)",
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });
    const loadTime = `${Date.now() - startTime}ms`;

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract metadata
    const title = $("title").text() || $('meta[property="og:title"]').attr("content") || "";
    const description =
      $('meta[name="description"]').attr("content") ||
      $('meta[property="og:description"]').attr("content") ||
      "";

    // Check for modern design indicators
    const hasModernDesign =
      html.includes("tailwind") ||
      html.includes("bootstrap") ||
      html.includes("flexbox") ||
      html.includes("grid") ||
      $('meta[name="viewport"]').length > 0;

    // Check mobile responsiveness
    const isMobileResponsive =
      $('meta[name="viewport"]').length > 0 ||
      html.includes("@media") ||
      html.includes("responsive");

    // Check SEO elements
    const hasSEO =
      $('meta[name="description"]').length > 0 &&
      $("title").length > 0 &&
      $("h1").length > 0 &&
      ($('meta[property="og:title"]').length > 0 || $('meta[name="twitter:title"]').length > 0);

    // Extract social media links
    const socialLinks: string[] = [];
    $(
      "a[href*='facebook.com'], a[href*='twitter.com'], a[href*='instagram.com'], a[href*='linkedin.com'], a[href*='youtube.com']"
    ).each((_: number, el: any) => {
      const href = $(el).attr("href");
      if (href) socialLinks.push(href);
    });

    // Get main content
    const content = $("body").text().replace(/\s+/g, " ").trim().substring(0, 5000);

    return {
      content,
      title,
      description,
      hasModernDesign,
      isMobileResponsive,
      loadTime,
      hasSEO,
      socialLinks: Array.from(new Set(socialLinks)),
    };
  } catch (error: any) {
    console.error(`Failed to scrape website ${url}:`, error.message);
    return {
      content: "",
      title: "",
      description: "",
      hasModernDesign: false,
      isMobileResponsive: false,
      loadTime: "N/A",
      hasSEO: false,
      socialLinks: [],
    };
  }
}

/**
 * Analyze business and generate sales intelligence using AI
 */
export async function analyzeBusinessWithAI(
  prospect: ProspectingResult,
  websiteData: Awaited<ReturnType<typeof scrapeAndAnalyzeWebsite>>,
  icp: ICP,
  clientOnePager: string,
  brandContext: string = ""
): Promise<Partial<ProspectingResult>> {
  try {
    const prompt = `You are an expert sales analyst for a web design and digital marketing agency. Analyze this business and provide detailed sales intelligence.

**Your Agency's Services:**
${clientOnePager}
${brandContext}

**Target ICP:**
- Industry: ${icp.industry}
- Business Type: ${icp.businessType}
- Known Pain Points: ${icp.painPoints || "Not specified"}
- Target Keywords: ${icp.targetKeywords || "Not specified"}

**Prospect Information:**
- Business Name: ${prospect.businessName}
- Industry: ${prospect.industry}
- Location: ${prospect.location}
- Rating: ${prospect.rating || "N/A"} (${prospect.reviewCount || 0} reviews)
- Phone: ${prospect.phone || "Not found"}
- Website: ${prospect.website || "No website found"}

**Website Analysis:**
- Has Website: ${prospect.website ? "Yes" : "No"}
- Title: ${websiteData.title || "N/A"}
- Modern Design: ${websiteData.hasModernDesign ? "Yes" : "No"}
- Mobile Responsive: ${websiteData.isMobileResponsive ? "Yes" : "No"}
- Load Time: ${websiteData.loadTime}
- Has SEO: ${websiteData.hasSEO ? "Yes" : "No"}
- Social Media Links: ${websiteData.socialLinks.length > 0 ? websiteData.socialLinks.join(", ") : "None found"}
- Content Preview: ${websiteData.content.substring(0, 500)}

**Analysis Required:**
Using the lead generation knowledge base methodology (BANT, CHAMP, digital presence scoring, automation opportunities), provide:

1. **Digital Presence Score** (0-100): Overall score based on website quality, SEO, social media
2. **Website Quality** (Poor/Fair/Good/Excellent): Assessment based on design, mobile, speed
3. **SEO Score** (Poor/Fair/Good/Excellent): Based on meta tags, structure, optimization
4. **Pain Points** (3-5 specific issues): Identify their biggest challenges
5. **Automation Opportunities** (2-3 specific): AI/automation solutions they need
6. **Sales Opportunities** (3-5 specific): Specific services to pitch
7. **Why Good Fit** (3-4 reasons): Why they match the ICP
8. **Talking Points** (3-5 specific): Personalized points to mention in outreach
9. **Recommended Package** (Basic/Standard/Premium): Best fit service tier
10. **Estimated Value** (dollar range): Potential deal size
11. **Priority** (high/medium/low): Lead priority based on ROI potential

**Important Guidelines:**
- Be specific and actionable
- Reference actual findings from their website/presence
- Use industry-specific language
- Focus on ROI and business impact
- Prioritize based on clear pain points and budget indicators

Return your analysis as a JSON object with these exact keys:
{
  "digitalPresenceScore": number,
  "websiteQuality": string,
  "seoScore": string,
  "socialMediaPresence": string,
  "googleBusinessProfile": string,
  "painPoints": string[],
  "automationOpportunities": string[],
  "salesOpportunities": string[],
  "whyGoodFit": string[],
  "talkingPoints": string[],
  "recommendedPackage": string,
  "estimatedValue": string,
  "priority": string,
  "marketSize": string,
  "competition": string,
  "demographics": string
}`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "You are an expert B2B sales analyst specializing in digital marketing and web development services. Provide detailed, actionable sales intelligence.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "business_analysis",
          strict: true,
          schema: {
            type: "object",
            properties: {
              digitalPresenceScore: { type: "number" },
              websiteQuality: { type: "string" },
              seoScore: { type: "string" },
              socialMediaPresence: { type: "string" },
              googleBusinessProfile: { type: "string" },
              painPoints: { type: "array", items: { type: "string" } },
              automationOpportunities: { type: "array", items: { type: "string" } },
              salesOpportunities: { type: "array", items: { type: "string" } },
              whyGoodFit: { type: "array", items: { type: "string" } },
              talkingPoints: { type: "array", items: { type: "string" } },
              recommendedPackage: { type: "string" },
              estimatedValue: { type: "string" },
              priority: { type: "string" },
              marketSize: { type: "string" },
              competition: { type: "string" },
              demographics: { type: "string" },
            },
            required: [
              "digitalPresenceScore",
              "websiteQuality",
              "seoScore",
              "socialMediaPresence",
              "googleBusinessProfile",
              "painPoints",
              "automationOpportunities",
              "salesOpportunities",
              "whyGoodFit",
              "talkingPoints",
              "recommendedPackage",
              "estimatedValue",
              "priority",
              "marketSize",
              "competition",
              "demographics",
            ],
            additionalProperties: false,
          },
        },
      },
    });

    const messageContent = response.choices[0].message.content;
    const contentStr = typeof messageContent === 'string' ? messageContent : JSON.stringify(messageContent);
    const analysis = JSON.parse(contentStr || "{}");

    return {
      digitalPresenceScore: analysis.digitalPresenceScore,
      websiteQuality: analysis.websiteQuality,
      seoScore: analysis.seoScore,
      socialMediaPresence: analysis.socialMediaPresence,
      googleBusinessProfile: analysis.googleBusinessProfile,
      painPoints: analysis.painPoints,
      automationOpportunities: analysis.automationOpportunities,
      salesOpportunities: analysis.salesOpportunities,
      whyGoodFit: analysis.whyGoodFit,
      talkingPoints: analysis.talkingPoints,
      recommendedPackage: analysis.recommendedPackage,
      estimatedValue: analysis.estimatedValue,
      priority: analysis.priority as "high" | "medium" | "low",
      marketSize: analysis.marketSize,
      competition: analysis.competition,
      demographics: analysis.demographics,
    };
  } catch (error: any) {
    console.error("Failed to analyze business with AI:", error.message);
    return {
      digitalPresenceScore: 0,
      websiteQuality: "Unknown",
      seoScore: "Unknown",
      painPoints: ["Analysis failed - manual review required"],
      priority: "low",
    };
  }
}

/**
 * Full prospecting workflow: Search, scrape, analyze, and enrich
 */
export async function runProspectingAgent(
  icp: ICP,
  clientOnePager: string,
  maxResults: number = 10,
  brandContext: string = ""
): Promise<ProspectingResult[]> {
  console.log(`[Prospecting Agent] Starting for ICP: ${icp.name}`);

  // Step 1: Search for businesses
  console.log(`[Prospecting Agent] Searching Google Maps for businesses...`);
  const prospects = await searchBusinessesByICP(icp, maxResults);
  console.log(`[Prospecting Agent] Found ${prospects.length} businesses`);

  // Step 2: Enrich each prospect
  const enrichedProspects: ProspectingResult[] = [];

  for (let i = 0; i < prospects.length; i++) {
    const prospect = prospects[i];
    console.log(
      `[Prospecting Agent] Analyzing ${i + 1}/${prospects.length}: ${prospect.businessName}`
    );

    // Scrape website if available
    let websiteData = {
      content: "",
      title: "",
      description: "",
      hasModernDesign: false,
      isMobileResponsive: false,
      loadTime: "N/A",
      hasSEO: false,
      socialLinks: [] as string[],
    };

    if (prospect.website) {
      try {
        websiteData = await scrapeAndAnalyzeWebsite(prospect.website);
      } catch (error) {
        console.error(`Failed to scrape ${prospect.website}:`, error);
      }
    }

    // AI analysis
    try {
      const aiAnalysis = await analyzeBusinessWithAI(prospect, websiteData, icp, clientOnePager, brandContext);
      const enrichedProspect = { ...prospect, ...aiAnalysis };
      enrichedProspects.push(enrichedProspect);
    } catch (error) {
      console.error(`Failed to analyze ${prospect.businessName}:`, error);
      enrichedProspects.push(prospect);
    }

    // Rate limiting - wait 1 second between requests
    if (i < prospects.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  console.log(`[Prospecting Agent] Completed analysis of ${enrichedProspects.length} prospects`);

  // Sort by priority and digital presence score
  enrichedProspects.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const aPriority = priorityOrder[a.priority || "low"];
    const bPriority = priorityOrder[b.priority || "low"];

    if (aPriority !== bPriority) {
      return bPriority - aPriority;
    }

    return (b.digitalPresenceScore || 0) - (a.digitalPresenceScore || 0);
  });

  return enrichedProspects;
}
