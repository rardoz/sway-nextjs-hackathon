import mock from "./mock.json";
import googleMock from "./google-mock.json";
import { Business, DetailsObject, Recommendations } from "./types";

export const HERO_SEARCH_DEFAULTS = [
  "What is your ideal vacation destination or rental?",
  "What amenities are most important to you?",
  "What is your budget range?",
  "Are you looking for a specific location?",
  "What was your favorite vacation or rental experience?",
  "When are you planning to travel?",
];

const MOCK_AI_MODE = process.env.NEXT_PUBLIC_MOCK_AI_MODE === "true";

export async function fetchOpenAIRecommendations(answers: string[]) {
  const formattedPrompt = HERO_SEARCH_DEFAULTS.map((question, index) => {
    return `Question ${index + 1}: ${question} Answer: ${answers[index]}`;
  }).join("\n");

  if (MOCK_AI_MODE) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mock);
      }, 2000);
    });
  }

  const openAIResponse = await fetch(
    "https://api.openai.com/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPEN_API_KEY_0}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        store: true,
        messages: [
          {
            role: "system",
            content:
              'You are a vacation and rental finder. Your primary function is to generate structured JSON output to help generate data for Google Places. I will send you a series of questions followed by answers to provide context. Based on this context, return recommendations in the following JSON format:\n\n{\n  "rentals": {\n    "top_10_recommendations": [\n      {\n        "business_name": "...",\n        "business_address": "...",\n        "business_city": "...",\n        "business_state": "...",\n        "business_country": "...",\n        "recommendation_title": "...",\n        "recommendation_summary": "...",\n        "appealing_description": "..."      }\n      // 9 more\n    ],\n    "best_deals": [ ... 10 objects ... ],\n    "most_popular": [ ... 10 objects ... ],\n    "most_luxurious": [ ... 10 objects ... ]\n  },\n  "vacation_destinations": {\n    "top_10_recommendations": [ ... 10 objects ... ],\n    "best_deals": [ ... 10 objects ... ],\n    "most_popular": [ ... 10 objects ... ],\n    "most_luxurious": [ ... 10 objects ... ]\n  }\n}\n\nEach item in each list must be an object with the following fields:\n- business_name\n- business_address\n- business_city\n- business_state\n- business_country\n- recommendation_title\n- recommendation_summary\n- appealing_description\n\nOnly return the JSON. Do not include any other text or explanation. Do not return broad results like a city. The locations you pick should be specific enough that could be an address associated to it. You should always return at least 10 results for each of the categories. There should never be an emtpy array value. The json should always be properly formatted. For the appealing_description fields, I want you to come up with something short and descriptive in less than 180 characters that explains why the place might be right for me. Do the same thing for the recommendation_summary field, but make sure it is at least 180 and no more than 250 characters and try to provide real value into the places that were recommended. Use the same value for recommendation_summary for all of the items found and make sure it properly summarizes all of the items found and should not be super specific on any one particular thing but it should give a good snapshot of all the results. recommendation_summary field should talk about why all of the results are a good match. This field must have a value. For the recommendation_title field, I want you to provide a short descriptive title based on the answers that were provided and it should mention the name of the city and country we are recommending the most. This field must have a value. Use the same value for recommendation_title for all of the items found.',
          },
          {
            role: "user",
            content: formattedPrompt,
          },
        ],
      }),
    },
  )
    .then((response) => {
      if (!response.ok) {
        console.error("Network response was not ok:", response);
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .catch((error) => {
      console.error("Error fetching data from OpenAI API:", error);
      // Handle the error as needed
      throw new Error("Error fetching data from OpenAI API");
    });
  return openAIResponse;
}

export async function fetchGoogleDetails(messageContent: string) {
  if (MOCK_AI_MODE) {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("Mocking Google API response");
        resolve(googleMock);
      }, 2000);
    });
  }
  const content: Recommendations = JSON.parse(messageContent);

  const businesses = Object.entries(content).flatMap(
    ([categoryKey, category]) =>
      Object.entries(category).flatMap(([typeKey, businessList]) =>
        (businessList as Business[]).map((business) => ({
          ...business,
          categoryKey,
          typeKey,
        })),
      ),
  ) as Business[];

  const googleApiUrl = "https://places.googleapis.com/v1/places:searchText";

  const fetchDetails = async (business: Business) => {
    const query = `${business.business_name}, ${business.business_address}, ${business.business_city}, ${business.business_state}, ${business.business_country}`;

    try {
      const response = await fetch(googleApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": `${process.env.GOOGLE_API_KEY}`, // Replace with your actual API key
          "X-Goog-FieldMask":
            "places.id,places.businessStatus,places.currentOpeningHours,places.priceRange,places.rating,places.userRatingCount,places.websiteUri,places.allowsDogs,places.editorialSummary,places.goodForChildren,places.reservable,places.displayName,places.formattedAddress,places.priceLevel,places.googleMapsUri,places.photos,places.types,places.internationalPhoneNumber",
        },
        body: JSON.stringify({
          textQuery: query,
          maxResultCount: 1,
        }),
      });
      if (!response.ok) {
        throw new Error(
          `Failed to fetch details for ${business.business_name}`,
        );
      }
      const data: DetailsObject = await response.json();
      const retVal = { ...business, ...data.places?.[0] };
      return retVal;
    } catch (error) {
      console.error(
        `Error fetching details for ${business.business_name}:`,
        error,
      );
      return { business, details: null };
    }
  };

  const results = await Promise.all(businesses.map(fetchDetails));
  return results;
}
