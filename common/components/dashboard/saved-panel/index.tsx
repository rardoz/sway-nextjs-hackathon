import Image from "next/image";
import { Star, Heart, MapPin } from "lucide-react";
import placeholderImage from "@/assets/images/card/placeholder.png";

import useUserDocumentContext from "@/common/providers/user-document";
import { tinyPlacesImageLoader } from "@/lib/image-loaders/places";
import SavedPanelSkeleton from "../saved-panel-skeleton";
import SavedPanelHeader from "../saved-panel-header";
import SavedPanelNoResults from "../saved-panel-no-results";

const SavedPanel: React.FC = () => {
  const { favorites, removeFavorite, isLoading } = useUserDocumentContext();

  if (isLoading) {
    return <SavedPanelSkeleton />;
  }

  if (favorites?.length === 0 && !isLoading) {
    return <SavedPanelNoResults />;
  }

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm bg-white border-gray-200">
      <SavedPanelHeader />
      <div className="p-6 pt-0">
        <div className="space-y-4">
          {favorites?.map((destination, index) => {
            const url = destination?.googlePlaceDataCache?.photos?.[0]?.name
              ? `https://places.googleapis.com/v1/${destination?.googlePlaceDataCache?.photos?.[0]?.name}/media/?`
              : placeholderImage.src; // Use placeholder if no photo is available

            return (
              <div
                key={index}
                className="flex items-start gap-4 py-4 border-b border-gray-200 last:border-b-0"
              >
                <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                  <Image
                    alt={
                      destination?.googlePlaceDataCache?.displayName?.text ||
                      "unknown"
                    }
                    src={url}
                    loader={
                      url !== placeholderImage.src
                        ? tinyPlacesImageLoader
                        : undefined
                    }
                    placeholder="blur"
                    width={64}
                    height={64}
                    blurDataURL={placeholderImage.src}
                    onError={(e) => {
                      e.currentTarget.src = placeholderImage.src;
                      e.currentTarget.srcset = "";
                    }} // Set fallback image on error
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => {
                      if (destination && removeFavorite)
                        removeFavorite(
                          destination.googlePlaceID,
                          destination.googlePlaceDataCache,
                          !destination.favorite,
                        );
                    }}
                    className="absolute top-0.5 right-0.5 inline-flex items-center justify-center text-red-500 bg-white/70 rounded-full p-0.5"
                  >
                    <Heart className="h-4 w-4 fill-red-500" />
                  </button>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-base truncate">
                    {destination?.googlePlaceDataCache?.displayName?.text ||
                      "unknown"}
                  </h4>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                    <div className="flex items-center min-w-0">
                      <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                      <span className="truncate">
                        {destination?.googlePlaceDataCache?.business_city}
                        {", "}
                        {destination?.googlePlaceDataCache?.business_country}
                      </span>
                    </div>
                    <div className="flex items-center text-sm flex-shrink-0">
                      <Star
                        size={16}
                        className="mr-1 text-yellow-500 fill-yellow-500"
                      />
                      <span>{destination?.googlePlaceDataCache?.rating}</span>
                    </div>
                  </div>

                  <a
                    rel="noopener"
                    target="_blank"
                    href={
                      destination?.googlePlaceDataCache?.websiteUri ||
                      destination?.googlePlaceDataCache?.googleMapsUri
                    }
                    className="text-sky-500 text-sm"
                  >
                    View
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SavedPanel;
