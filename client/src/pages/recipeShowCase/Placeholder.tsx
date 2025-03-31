import { Recipe } from "@/types";
import { Loader } from "lucide-react";

export default function Placeholder({ image, title }: Recipe) {
  return (
    <div className="bg-[#fef3d0] min-h-screen pt-24">
      <div className="max-w-2xl mx-auto p-6 bg-[#fadaae] shadow-lg rounded-lg mt-10 border border-gray-200">
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
        {/* Loading Circle */}
        <div className="flex justify-center mt-4">
          <Loader className="animate-spin text-[#a84e24]" size={24} />
        </div>
      </div>
    </div>
  );
}
