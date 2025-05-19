// interface headingProps {
//   image: string;
//   title: string;
//   readyInMinutes: number;
//   servings: number;
//   diets: [];
// }
import defaultImage from "/src/assets/Untitled design.jpg"

// Function to ensure image URL has a jpg extension
  const ensureJpgExtension = (imageUrl: string | undefined): string => {
    if (!imageUrl) return defaultImage;
    
    // Check if the URL ends with a file extension
    const hasFileExtension = /\.\w+$/.test(imageUrl);
    
    // If it has a period but no recognized image extension, append jpg
    if (imageUrl.includes('.') && !hasFileExtension) {
      return `${imageUrl}jpg`;
    }
    
    return imageUrl;
  };

export default function Heading({
  image,
  title,
  readyInMinutes,
  servings,
  diets,
}: any) {
  return (
    <>
      {/* Recipe Image */}
      <div className="mb-6 space-y-6">
        {image ? (
            <img
              src={ensureJpgExtension(image)}
              alt={title}
              className="w-full h-64 object-cover rounded-md"
            />
          ) : (
            <img
              src={defaultImage}
              alt="Default recipe image"
              className="w-full h-64 object-cover rounded-md"
            />
          )}
      </div>
      
      {/* Recipe Title */}
      <h2 className="text-3xl font-bold text-[#a84e24] mb-4">{title}</h2>

      {/* Ready in Minutes */}
      {readyInMinutes && (
        <h4 className="text-lg font-bold text-[#a84e24]">
          Ready in:{" "}
          <span className="text-black font-medium">
            {readyInMinutes} minutes
          </span>
        </h4>
      )}

      {/* Servings */}
      {servings && (
        <h4 className="text-lg font-bold text-[#a84e24]">
          Servings: <span className="text-black font-medium">{servings}</span>
        </h4>
      )}

      {/* Diets */}
      {diets && diets.length > 0 && (
        <h4 className="text-lg font-bold text-[#a84e24]">
          Diets:{" "}
          <span className="text-black font-medium">{diets.join(", ")}</span>
        </h4>
      )}
    </>
  );
}
