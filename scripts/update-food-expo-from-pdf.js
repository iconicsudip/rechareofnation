const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function updateFoodExpo() {
  console.log('Updating Food Expo 2027 from 12-page official brochure PDF...');

  const slug = 'udaipur-hospitality-catering-tourism-food-festival-2025';

  const dummyImg1 = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80';
  const dummyImg2 = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80';
  const dummyImg3 = 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1200&q=80';
  const dummyImg4 = 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1200&q=80';
  const dummyImg5 = 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1200&q=80';
  const dummyImg6 = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80';
  const dummyImg7 = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80';
  const dummyImg8 = 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80';

  const highlights = [
    {
      title: "Food & Hospitality Exhibition",
      description: "A comprehensive showcase of innovative equipment, services, and commercial supplies across food processing, hospitality, catering, and allied industries.",
      image: dummyImg1,
      tags: ["Commercial Kitchen", "Bakery Ovens", "Refrigeration", "Food Brands"]
    },
    {
      title: "Live Cooking & Masterclass Demos",
      description: "Live cooking demonstrations and interactive masterclasses by acclaimed master chefs, sweet masters, and pioneering food innovators.",
      image: dummyImg2,
      tags: ["Chef Masterclasses", "Live Cooking", "Product Demos", "Technique Sessions"]
    },
    {
      title: "Halwai & Traditional Food Showcase",
      description: "A grand stage celebrating royal Rajasthani sweets, namkeen manufacturers, heritage mithai recipes, and regional confectionery culture.",
      image: dummyImg3,
      tags: ["Halwai Heritage", "Mithai Showcase", "Namkeen", "Traditional Food"]
    },
    {
      title: "B2B Business Meetings & Networking",
      description: "Dedicated matchmaking sessions connecting hotel GMs, purchase managers, caterers, suppliers, distributors, and corporate buyers.",
      image: dummyImg4,
      tags: ["B2B Matchmaking", "Distributor Tie-ups", "Direct Leads", "Institutional Buyers"]
    },
    {
      title: "Food, Hospitality & Business Conclave",
      description: "High-impact knowledge sessions with industry leaders discussing the future of food business, automation, culinary tourism, and scaling operations.",
      image: dummyImg5,
      tags: ["Industry Conclave", "Knowledge Sessions", "Food Tech", "Hospitality Trends"]
    },
    {
      title: "Product & Machinery Launchpad",
      description: "Exclusive platform for launching next-generation kitchen automation, sweet-making machinery, food tech solutions, and packaging products.",
      image: dummyImg6,
      tags: ["Product Launches", "Food Technology", "Packaging Machinery", "POS Systems"]
    },
    {
      title: "Cultural Heritage Evenings",
      description: "Vibrant cultural celebrations featuring Rajasthani folk music, dance performances, and traditional culinary celebrations.",
      image: dummyImg7,
      tags: ["Folk Music & Dance", "Rajasthan Culture", "Networking Dinners", "Gala Evenings"]
    },
    {
      title: "Industry Excellence Awards",
      description: "Prestigious national recognition honoring industry achievers, innovative food brands, master halwais, and visionary hospitality leaders.",
      image: dummyImg8,
      tags: ["Excellence Awards", "Industry Achievers", "Brand Honors", "Felicitations"]
    }
  ];

  const exhibitPillars = [
    {
      title: "Brand Visibility",
      subtitle: "Industry Recognition",
      description: "Showcase your brand in front of a targeted industry audience of hotel GMs, restaurateurs, caterers, and food entrepreneurs from across India.",
      image: dummyImg1,
      stats: "15,000+ Trade Footfall",
      highlights: ["Main Pavilion Stalls", "Official Souvenir Inclusion", "Stage & Entrance Branding"]
    },
    {
      title: "New Buyers & Direct Leads",
      subtitle: "High-Intent Procurement",
      description: "Generate verified procurement leads directly from hotels, luxury resorts, banquet caterers, halwai manufacturers, and wedding planners.",
      image: dummyImg2,
      stats: "5,000+ Verified Buyers",
      highlights: ["Direct Order Booking", "Procurement Head Access", "Vendor Registrations"]
    },
    {
      title: "B2B Networking & Dealerships",
      subtitle: "Distribution Expansion",
      description: "Network with wholesale dealers, regional distributors, raw material suppliers, and institutional buyers seeking new partnerships.",
      image: dummyImg3,
      stats: "18+ Industry Sectors",
      highlights: ["Distributor Meetings", "Multi-State Tie-ups", "Dealer Expansion"]
    },
    {
      title: "Live Product Demonstrations",
      subtitle: "Hands-on Engagement",
      description: "Demonstrate commercial kitchen equipment, bakery ovens, automation machinery, and food products live to active purchasers.",
      image: dummyImg4,
      stats: "3 Days Live Demos",
      highlights: ["Live Machinery Demos", "Chef Taste Tests", "Audience Immersion"]
    },
    {
      title: "Business & Territory Expansion",
      subtitle: "Market Penetration",
      description: "Penetrate western India's booming hospitality and destination wedding markets across Rajasthan, Gujarat, Madhya Pradesh, and Delhi-NCR.",
      image: dummyImg5,
      stats: "Pan-India Reach",
      highlights: ["Regional Foothold", "Destination Wedding Access", "Tier 2 & 3 Growth"]
    },
    {
      title: "Partnership Opportunities",
      subtitle: "Corporate & Strategic Tie-ups",
      description: "Establish corporate tie-ups, institutional supply contracts, bulk deals, and long-term brand collaborations.",
      image: dummyImg6,
      stats: "100+ Corporate MoUs",
      highlights: ["Strategic Alliances", "Institutional Contracts", "Annual Supply Deals"]
    }
  ];

  const visitPillars = [
    {
      title: "Source Direct from Manufacturers",
      subtitle: "Wholesale Trade Advantage",
      description: "Meet 200+ leading exhibitors, discover breakthrough commercial kitchen equipment, compare products, and negotiate wholesale trade rates.",
      image: dummyImg1,
      stats: "200+ Leading Brands",
      highlights: ["Equipment & Machinery", "Spices, Dairy & Ingredients", "Tableware & Uniforms"]
    },
    {
      title: "Industry Conclave & Expert Knowledge",
      subtitle: "Insights & Market Trends",
      description: "Attend high-level conclave sessions on the future of food business, modern halwai technology, cloud kitchens, and culinary tourism.",
      image: dummyImg2,
      stats: "30+ Industry Speakers",
      highlights: ["Food Tech & Automation", "FSSAI & Hygiene Standards", "Branding & Digital Growth"]
    },
    {
      title: "Live Chef Demonstrations & Masterclasses",
      subtitle: "Culinary Inspiration",
      description: "Watch live culinary masterclasses and authentic sweet-making demonstrations by master chefs and veteran halwai artisans.",
      image: dummyImg3,
      stats: "15+ Live Masterclasses",
      highlights: ["Traditional Halwai Craft", "Modern Bakery Techniques", "Menu Engineering"]
    },
    {
      title: "Destination Weddings & HoReCa Ecosystem",
      subtitle: "Rajasthan Hospitality Network",
      description: "Connect with destination wedding planners, caterers, banquet owners, hoteliers, and tour operators in the heart of Udaipur.",
      image: dummyImg4,
      stats: "Top HoReCa Network",
      highlights: ["Wedding Planners", "Outdoor Caterers", "Luxury Banquets & Resorts"]
    }
  ];

  const sponsorshipTiers = [
    {
      tier: "Presenter",
      amount: "₹90,00,000",
      benefits: "Exclusive Presenter title status across expo ground, main entrance arch & grand stage. 50 VIP delegate passes, prime 50 sq. m pavilion space, keynote address, official souvenir double-page spread, national press release visibility, and award felicitation honor."
    },
    {
      tier: "Title Sponsor",
      amount: "₹75,00,000",
      benefits: "Prominent Title Sponsor association across main stage backdrop, entrance gateway, and delegate lanyards. 40 VIP delegate passes, 36 sq. m prime exhibition space, conclave panel moderation, souvenir front spread, and media conference feature."
    },
    {
      tier: "Powered By",
      amount: "₹51,00,000",
      benefits: "Co-branding across all entry gates, visitor badges, exhibition halls, and digital campaigns. 30 VIP passes, 24 sq. m stall space, conclave session co-hosting, and national PR coverage."
    },
    {
      tier: "Co-Sponsor",
      amount: "₹31,00,000",
      benefits: "Prominent corridor branding, stage banner placement, 20 VIP passes, 18 sq. m prime stall, full page official souvenir advertisement, and award presentation honor."
    },
    {
      tier: "F&B Partner",
      amount: "₹18,00,000",
      benefits: "Exclusive dining arena and food court branding, sampling privileges, 15 VIP passes, 12 sq. m stall, stage mentions, and culinary masterclass partner credit."
    },
    {
      tier: "Associate Sponsor",
      amount: "₹15,00,000",
      benefits: "Corridor banners, brochure branding, 10 VIP passes, 12 sq. m stall, souvenir advertisement, and social media spotlight campaign."
    },
    {
      tier: "Hospitality Partner",
      amount: "₹15,00,000",
      benefits: "Official Hospitality Partner title, VIP delegate lounge branding, stage credits, 10 VIP passes, 12 sq. m exhibition space, and hotelier conclave recognition."
    },
    {
      tier: "Cultural Event Partner",
      amount: "₹10,00,000",
      benefits: "Exclusive cultural evening stage branding, VIP gala dinner hosting association, 10 passes, and on-stage felicitation with festival memento."
    },
    {
      tier: "Conclave Partner",
      amount: "₹7,00,000",
      benefits: "Knowledge Conclave session title branding, speaking slot, 8 delegate passes, branding on all conclave collateral, and attendee directory access."
    },
    {
      tier: "Award Partner",
      amount: "₹5,00,000",
      benefits: "Official Food Expo Industry Awards presenter, logo placement on all award trophies & certificates, stage presentation honor, and 5 VIP passes."
    }
  ];

  const stallOptions = [
    {
      type: "Regular Stall (3m × 3m / 9 sq. m)",
      rate: "₹40,000",
      size: "3m × 3m (9 sq. m)",
      includes: "Octanorm shell scheme stall, custom fascia name board, 1 display table, 2 chairs, spot lights, 5A electrical power point, carpet flooring, dustbin, and official exhibitor directory listing."
    },
    {
      type: "Premium Stall (3m × 4m / 12 sq. m)",
      rate: "₹75,000",
      size: "3m × 4m (12 sq. m)",
      includes: "Prime corner or main aisle location, spacious shell scheme, custom fascia, 2 tables, 4 chairs, spot lights, 15A power connection, carpet, priority B2B matchmaking, and 4 exhibitor badges."
    }
  ];

  const adRates = [
    { category: "Cover Page - Front", amount: "₹5,00,000" },
    { category: "Cover Page - Back", amount: "₹3,00,000" },
    { category: "Starting 10 Pages", amount: "₹50,000" },
    { category: "Starting 10 to 20 Pages", amount: "₹32,000" },
    { category: "Full Page", amount: "₹21,000" },
    { category: "Half Page", amount: "₹15,000" },
    { category: "Quarter Page", amount: "₹8,000" },
    { category: "Address Entry - Multi Colour", amount: "₹3,300" }
  ];

  const scheduleDays = [
    {
      date: "2027-01-06",
      title: "Day 1: Grand Inauguration, Expo Opening & HoReCa Conclave",
      sessions: [
        {
          time: "10:00 AM - 11:30 AM",
          title: "Inauguration Ceremony & VIP Exhibition Tour",
          speaker: "Dignitaries, Halwai Vyapar Kalyan Sansthan & Laxmi Publicity Leaders",
          description: "Auspicious lamp lighting, ribbon cutting, and VIP walkthrough of all 8 thematic expo zones."
        },
        {
          time: "11:30 AM - 01:30 PM",
          title: "Conclave Track 1: Future of Food Business & HoReCa Trends",
          speaker: "Hotel General Managers, Food Entrepreneurs & Industry Economists",
          description: "Keynote panel analyzing post-pandemic food growth, luxury resort dining, and institutional supply chains."
        },
        {
          time: "02:00 PM - 03:30 PM",
          title: "Live Culinary Masterclass & Chef Demonstrations",
          speaker: "Celebrity Master Chefs & Culinary Academies",
          description: "Live interactive cooking demonstrations showcasing modern gastronomy and fusion catering."
        },
        {
          time: "03:30 PM - 05:30 PM",
          title: "B2B Buyer-Seller Matchmaking & Equipment Showcases",
          speaker: "Machinery Manufacturers & Procurement Heads",
          description: "Direct one-on-one trade appointments between equipment manufacturers and commercial buyers."
        },
        {
          time: "06:00 PM - 08:00 PM",
          title: "Welcome Cultural Evening: Rajasthani Folk Heritage & Dinner",
          speaker: "Renowned Folk Troupe & Festival Custodians",
          description: "Traditional Rajasthani folk music, Manganiyar performance, Kalbelia dance, and networking dinner."
        }
      ]
    },
    {
      date: "2027-01-07",
      title: "Day 2: Modern Halwai Conclave, Technology & Awards Gala",
      sessions: [
        {
          time: "10:00 AM - 12:00 PM",
          title: "Conclave Track 2: The Modern Halwai Industry — Automation & Exports",
          speaker: "Veteran Sweet Manufacturers & Food Tech Innovators",
          description: "Transitioning traditional mithai workshops into automated, hygienic, export-grade manufacturing plants."
        },
        {
          time: "12:00 PM - 01:30 PM",
          title: "Live Halwai & Traditional Sweets Masterclass",
          speaker: "Master Halwai Craftsmen",
          description: "Live demonstrations of intricate heritage Rajasthani sweets, ghevar crafts, and namkeen blending."
        },
        {
          time: "02:00 PM - 04:00 PM",
          title: "New Product & Machinery Launchpad",
          speaker: "Exhibitor Product Engineering Heads",
          description: "Unveiling new bakery machinery, commercial refrigeration units, and packaging automation systems."
        },
        {
          time: "04:00 PM - 05:30 PM",
          title: "Conclave Track 3: Food Safety, FSSAI Standards & Green Kitchens",
          speaker: "Food Safety Auditors & Kitchen Design Consultants",
          description: "Regulatory compliance, zero-waste kitchen practices, and energy-efficient equipment setups."
        },
        {
          time: "06:30 PM - 09:30 PM",
          title: "Grand Food Expo Industry Excellence Awards 2027",
          speaker: "Jury Panel, Industry Titans & Special Guests",
          description: "Gala felicitation honoring pioneering restaurateurs, veteran sweet makers, and standout food brands."
        }
      ]
    },
    {
      date: "2027-01-08",
      title: "Day 3: Destination Weddings, Tourism & Valedictory Session",
      sessions: [
        {
          time: "10:00 AM - 12:00 PM",
          title: "Conclave Track 4: Wedding & Destination Catering in Rajasthan",
          speaker: "Luxury Wedding Planners & Royal Banquet Caterers",
          description: "Trends in grand destination wedding menus, live food stations, bespoke catering decor, and luxury service."
        },
        {
          time: "12:00 PM - 01:30 PM",
          title: "Culinary Tourism & Regional Heritage Food Promotion",
          speaker: "Tourism Board Officials & Heritage Hoteliers",
          description: "Promoting Rajasthan as a global culinary tourism destination and integrating local gastronomy."
        },
        {
          time: "02:00 PM - 04:00 PM",
          title: "Institutional Procurement Roundtables",
          speaker: "Hotel Chains, Resort Groups & Catering Consortiums",
          description: "Final bulk contract sign-offs, dealership handshakes, and institutional purchase confirmations."
        },
        {
          time: "04:30 PM - 06:00 PM",
          title: "Valedictory Ceremony, Exhibitor Felicitations & Wrap-up",
          speaker: "Organizing Committee",
          description: "Distribution of participation mementos, certificates of honor, and announcements for Food Expo 2028."
        }
      ]
    }
  ];

  const faqs = [
    {
      question: "What are the official dates, venue and timings of Food Expo 2027?",
      answer: "Food Expo 2027 takes place from 6th to 8th January 2027 at The Lalit / Shikarbadi Grounds, Udaipur, Rajasthan. The exhibition gates are open daily from 10:00 AM to 07:00 PM."
    },
    {
      question: "Who can attend the exhibition and is visitor entry free?",
      answer: "Trade visitor entry is complimentary for industry professionals including hoteliers, restaurateurs, caterers, sweet and namkeen manufacturers, chefs, wedding planners, equipment buyers, and food entrepreneurs with pre-registration."
    },
    {
      question: "What stall options are available for exhibitors?",
      answer: "Exhibitors can book a 3m × 3m Regular Stall (₹40,000) or a 3m × 4m Premium Stall (₹75,000). Both include octanorm shell scheme, fascia, furniture, lighting, and power points."
    },
    {
      question: "What sponsorship opportunities exist for brands?",
      answer: "We offer 10 comprehensive partnership tiers ranging from Presenter (₹90,00,000), Title Sponsor (₹75,00,000), Powered By (₹51,00,000) down to Conclave Partner (₹7,00,000) and Award Partner (₹5,00,000)."
    },
    {
      question: "How can brands advertise in the Official Souvenir publication?",
      answer: "Official Souvenir advertising spaces include Cover Pages (Front: ₹5,00,000, Back: ₹3,00,000), Starting Section Pages (₹32,000–₹50,000), Full Page (₹21,000), Half Page (₹15,000), Quarter Page (₹8,000), and Multi-Colour Directory entries (₹3,300)."
    },
    {
      question: "Where can I download the official 12-page event brochure?",
      answer: "You can download the official Food Expo 2027 12-Page Brochure PDF directly using the 'View PDF' button on this page."
    }
  ];

  const rules = [
    "Exhibitor stall setup must be completed by 5 January 2027 at 08:00 PM.",
    "Food tasting and sampling must strictly comply with FSSAI hygiene standards.",
    "Live fire and commercial cooking are permitted exclusively in designated Live Demo & Food Court zones.",
    "Digital QR badge verification is mandatory at all entry gates for all delegates, exhibitors, and trade visitors."
  ];

  const organizer = {
    name: "Halwai Vyapar Kalyan Sansthan × Laxmi Publicity",
    email: "foodexpo2027@gmail.com",
    phone: "+91 9928501845",
    contact: "Connecting food, hospitality, catering, halwai, wedding, and tourism businesses. 26+ Years Industry Legacy, 18+ National Publications, 75+ Grand Events Executed, 12+ Major Exhibitions & Expos."
  };

  const richDescription = `
<h3>Where Food Meets Business — Food Expo 2027</h3>
<p>Connecting food, hospitality, catering, halwai, wedding, and tourism businesses on one premier platform in the City of Lakes, Udaipur. Food Expo 2027 (6, 7 & 8 January 2027) brings together culinary masters, industry visionaries, leading manufacturers, and trade buyers across India.</p>

<h3>26+ Years of Industry Legacy</h3>
<ul>
  <li><strong>26+ Years</strong> Industry Heritage & Leadership</li>
  <li><strong>18+ National Publications</strong> & Official Industry Releases</li>
  <li><strong>75+ Grand Events Executed</strong> across Western & Northern India</li>
  <li><strong>12+ Major Trade Exhibitions</strong> & National Expos</li>
</ul>

<h3>8 Proposed Thematic Event Zones</h3>
<ol>
  <li><strong>Food & Mithai Zone:</strong> Halwai, Mithai, Namkeen, Traditional Regional Foods & Confectionery</li>
  <li><strong>Hospitality Zone:</strong> Hotels, Resorts, Homestays, Restaurants, Cafes & Banquet Enclaves</li>
  <li><strong>Catering Zone:</strong> Commercial Equipment, Outdoor Catering Services & Cloud Kitchen Setups</li>
  <li><strong>Kitchen & Equipment Zone:</strong> Commercial Cooking Ranges, Bakery Ovens, Refrigeration & Food Processing Machinery</li>
  <li><strong>Wedding & Events Zone:</strong> Destination Wedding Planners, Decorators, Sound, Lighting & Floral Styling</li>
  <li><strong>Tourism & Culture Zone:</strong> Tourism Boards, Destination Management, Travel Operators & Rajasthani Heritage Food</li>
  <li><strong>Food Technology Zone:</strong> POS Systems, Kitchen Automation, Packaging Solutions & Digital Business Software</li>
  <li><strong>Live Demo Zone:</strong> Live Cooking Masterclasses, Culinary Demonstrations & Chef Workshops</li>
</ol>

<h3>Who Should Exhibit</h3>
<p>Kitchen & Bakery Equipment Manufacturers, Tableware & Interior Suppliers, Food & Beverage Brands, Spices & Dairy Producers, Packaging & Disposable Product Vendors, POS & Automation Providers, Wedding Supplies, and Tourism Services.</p>

<h3>Industry Conclave Topics</h3>
<ul>
  <li>Future of the Food & HoReCa Business in India</li>
  <li>The Modern Halwai Industry — Automation, Hygiene & Export Scalability</li>
  <li>Emerging Food Technologies & Automated Kitchen Equipment</li>
  <li>Hospitality Trends & Sustainable Zero-Waste Kitchens</li>
  <li>Destination Weddings & Grand Scale Banquet Catering in Rajasthan</li>
  <li>Culinary Tourism & Regional Heritage Food Promotion</li>
  <li>Food Safety, Hygiene & FSSAI Best Practices</li>
  <li>Branding, Digital Visibility & Territory Expansion</li>
</ul>
  `.trim();

  await sql`
    UPDATE events
    SET 
      name = 'Udaipur Hospitality, Catering & Food Festival (Food Expo 2027)',
      event_date = '2027-01-06',
      event_time = '10:00 AM - 07:00 PM',
      venue = 'The Lalit / Shikarbadi Grounds, Udaipur',
      city = 'Udaipur, Rajasthan',
      category = 'Food • Hospitality • Catering',
      summary = 'Where Food Meets Business. Connecting food, hospitality, catering, halwai, wedding, and tourism businesses on one platform (6, 7 & 8 January 2027, Udaipur, Rajasthan). Exhibition • Conclave • Live Demonstrations • B2B Networking.',
      description = ${richDescription},
      brochure_pdf_url = '/brochures/Food_Expo_2027_12_Page_Brochure.pdf',
      highlights = ${JSON.stringify(highlights)}::jsonb,
      exhibit_pillars = ${JSON.stringify(exhibitPillars)}::jsonb,
      visit_pillars = ${JSON.stringify(visitPillars)}::jsonb,
      sponsorship_tiers = ${JSON.stringify(sponsorshipTiers)}::jsonb,
      stall_options = ${JSON.stringify(stallOptions)}::jsonb,
      ad_rates = ${JSON.stringify(adRates)}::jsonb,
      schedule_days = ${JSON.stringify(scheduleDays)}::jsonb,
      faqs = ${JSON.stringify(faqs)}::jsonb,
      rules = ${JSON.stringify(rules)}::jsonb,
      organizer = ${JSON.stringify(organizer)}::jsonb,
      date_is_tentative = false,
      is_featured = true
    WHERE slug = ${slug}
  `;

  console.log('✅ Successfully updated Food Expo 2027 in database with all 12-page PDF brochure content!');
}

updateFoodExpo()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Error updating event:', err);
    process.exit(1);
  });
