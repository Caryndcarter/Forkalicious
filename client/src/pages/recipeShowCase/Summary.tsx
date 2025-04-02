// interface summaryProps {}

const RawHtmlRenderer = ({ htmlString }: { htmlString: string }) => {
  // Replace multiple line breaks with a single space or remove unwanted elements
  const cleanHtml = htmlString.replace(/<\/?[^>]+(>|$)/g, ""); // removes HTML tags if needed
  return <span dangerouslySetInnerHTML={{ __html: cleanHtml }} />;
};

export default function Summary({
  summary,
  ingredients,
  instructions,
  steps,
  sourceUrl,
  spoonacularSourceUrl,
}: any) {
  return (
    <>
      {/* Recipe Summary */}
      <div className="mb-8">
        <h3 className="text-2xl font-semibold text-[#a84e24] mb-4">Summary</h3>
        {/* Render the instructions as HTML */}
        <RawHtmlRenderer htmlString={summary} />
      </div>

      {/* Ingredients List */}
      <div className="mb-8">
        <h3 className="text-2xl font-semibold text-[#a84e24] mb-4">
          Ingredients
        </h3>
        <ul className="list-disc list-inside space-y-2">
          {ingredients?.map((ingredient: string, index: number) => (
            <li key={index} className="text-gray-800">
              {ingredient}
            </li>
          ))}
        </ul>
      </div>

      {/* Cooking Instructions */}
      <div className="mb-8">
        <h3 className="text-2xl font-semibold text-[#a84e24] mb-4">
          Instructions
        </h3>
        {/* Render the instructions as HTML */}
        <RawHtmlRenderer htmlString={instructions} />
      </div>

      {/* Steps List */}
      <div className="mb-8">
        <h3 className="text-2xl font-semibold text-[#a84e24] mb-4">Steps</h3>
        <ol className="list-decimal list-inside space-y-2">
          {steps?.slice(0, -1).map((step: string, index: number) => (
            <li key={index} className="text-gray-800">
              <RawHtmlRenderer htmlString={step} />
            </li>
          ))}
        </ol>
      </div>

      {/* Recipe Source Links */}
      <div className="mb-8 flex space-x-4">
        {sourceUrl && (
          <h4 className="text-lg font-bold text-[#a84e24]">
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-black font-medium underline"
            >
              Recipe Source
            </a>
          </h4>
        )}
        {spoonacularSourceUrl && (
          <h4 className="text-lg font-bold text-[#a84e24]">
            <a
              href={spoonacularSourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-black font-medium underline"
            >
              Spoonacular Recipe
            </a>
          </h4>
        )}
      </div>
    </>
  );
}
