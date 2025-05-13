// interface headingProps {
//   image: string;
//   title: string;
//   readyInMinutes: number;
//   servings: number;
//   diets: [];
// }
import defaultImage from "/src/assets/Untitled design.jpg"

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
              src={image}
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
