import localStorageService from "@/utils_graphQL/localStorageService";

export default function LastRefreshed() {
  const timeStamp = localStorageService.getSavedRecipesTimeStamp();
  return timeStamp ? (
    <div className="text-sm text-gray-500 mt-2">
      Last refreshed: {timeStamp.toLocaleString()}
    </div>
  ) : (
    <div className="text-sm text-gray-500 mt-2">No timestamp available</div>
  );
}
