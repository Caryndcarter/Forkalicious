export default interface UserDetails {
    id: number | null; 
    userName: string | null;
    userEmail: string | null;
    userPassword: string | null; 
    intolerance?: string[] | null;
    diet?: string | null;
    favIngredients?: string[] | null; 
    savedRecipes?: string[] | null; 
}