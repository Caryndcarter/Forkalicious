import { Recipe } from "@/types";

export default function Placeholder({ image, title }: Recipe) {
  return (
    <>
      {/* Recipe Image */}
      <div className="mb-6 space-y-6">
        <img
          src={image ?? "./placeholder.svg"}
          alt="Recipe"
          className="w-full h-64 object-cover rounded-md"
        />
      </div>

      {/* Recipe Title */}
      <h2 className="text-3xl font-bold text-[#a84e24] mb-4">{title}</h2>
    </>
  );
}
