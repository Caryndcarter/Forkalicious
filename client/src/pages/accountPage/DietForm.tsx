import { useState } from "react";
import { DropDownMultiSelect, DropDownSelection } from "@/components/forms";
import { dietOptions, intoleranceOptions } from "@/types";
import { 
  Dialog as ShadcnDialog, 
  DialogContent as ShadcnDialogContent, 
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Create a custom DialogContent that removes the close button
const DialogContent = ({ children, ...props }: React.ComponentProps<typeof ShadcnDialogContent>) => (
  <ShadcnDialogContent 
    {...props}
    onPointerDownOutside={(e) => e.preventDefault()} 
    onEscapeKeyDown={(e) => e.preventDefault()}
    onInteractOutside={(e) => e.preventDefault()}
    className={`${props.className || ""} no-close-button`}
    style={{ 
      ...props.style,
      "--tw-dialog-close-display": "none"
     } as React.CSSProperties}
  >
    {children}
  </ShadcnDialogContent>
);

interface DietFormProps {
  formValues: {
    diet: string;
    intolerances: string[];
  };
  handleAccountUpdate: (updatedDiet: any) => void;
}

export default function DietForm({
  formValues,
  handleAccountUpdate,
}: DietFormProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Function to handle dialog open state - prevents closing with escape key or clicking outside
  const handleOpenChange = (open: boolean) => {
    // Only allow opening the dialog, not closing it
    if (open) {
      setIsOpen(true);
    }
    // Ignore close attempts - the modal can only be closed via form submission
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const updatedDiet: any = Object.fromEntries(formData.entries());

    updatedDiet.intolerances = [];

    for (const [key, value] of formData) {
      const stringValue = value as string;

      if (key.includes("intolerance")) {
        stringValue ? updatedDiet.intolerances.push(stringValue) : null;
        delete updatedDiet[key];
      }
    }

    handleAccountUpdate(updatedDiet);
    setIsOpen(false); // Close the modal after submission
  };

  // Create a style element for global CSS
  const NoCloseButtonStyle = () => {
    if (typeof document !== "undefined") {
      // Only run in browser environment
      const styleId = "no-close-button-style";
      if (!document.getElementById(styleId)) {
        const styleEl = document.createElement("style");
        styleEl.id = styleId;
        styleEl.innerHTML = `
          .no-close-button button[data-ui-close-button],
          .no-close-button [aria-label="Close"],
          .no-close-button button:has(svg):first-child {
            display: none !important;
          }
        `;
        document.head.appendChild(styleEl);
      }
    }
    return null;
  };

  // Display-only view component
  const DisplayView = () => (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Dietary Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Diet</h3>
          <p className="font-medium">{formValues.diet || "No diet specified"}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Intolerances</h3>
          <div className="flex flex-wrap gap-2 mt-1">
            {formValues.intolerances && formValues.intolerances.length > 0 ? (
              formValues.intolerances.map((intolerance, index) => (
                <Badge key={index} variant="secondary">{intolerance}</Badge>
              ))
            ) : (
              <p>No intolerances specified</p>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <NoCloseButtonStyle />
        <ShadcnDialog 
          open={isOpen} 
          onOpenChange={handleOpenChange}
          modal={true}
        >
          <DialogTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Edit Preferences
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Dietary Preferences</DialogTitle>
            </DialogHeader>
            <form id="filter-form" onSubmit={handleSubmit} className="space-y-6 pt-4">
              <DropDownSelection
                name="Diet"
                placeholder="Select a diet"
                initialSelection={formValues.diet}
                options={dietOptions}
              />

              <DropDownMultiSelect
                name="Intolerance"
                placeholder="Select your Intolerances"
                options={intoleranceOptions}
                initialSelection={formValues.intolerances}
              />

              <div className="flex justify-end">
                <Button 
                  type="submit"
                  id="submit-search-filters"
                  className="bg-orange-500 text-white hover:bg-orange-600"
                >
                  Update Preferences
                </Button>
              </div>
            </form>
          </DialogContent>
        </ShadcnDialog>
      </CardFooter>
    </Card>
  );

  return <DisplayView />;
}