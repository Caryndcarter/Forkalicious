
import  UserDetails  from "../interfaces/userDetails.js"; 


// 1. GET /api/users - Get all users
// Retrieve all users from the API
const retrieveUsers = async () => {
    try {
      const response = await fetch('/api/users/databaseUsers', {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error('invalid user API response, check network tab!');
      }
  
      return data;
    } catch (err) {
      console.log('Error from data retrieval:', err);
      return [];
    }
  };
  

// 2. GET api/users/:id - Get a user by ID
// Retrieve a single user by ID from the Database
const retrieveSimpleUser = async (id: number | undefined) => {
    try {
      const response = await fetch(`/api/users/${id}`, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error('Invalid API response, check network tab!');
      }
  
      return data;
  
    } catch (err) {
      console.log('Error from user retrieval:', err);
      return {};
    }
  }


// 3. GET api/users/:id - Get a user by ID
// Retrieve a single user by ID from the API
const retrieveUser = async () => {
    try {
      const response = await fetch(`/api/users/userRecipes`, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error('Invalid API response, check network tab!');
      }
  
      return data;
  
    } catch (err) {
      console.log('Error from user retrieval:', err);
      return {};
    }
  }



// 3. POST api/users - Create a new user
// Add a new user via POST request to the API
const addUser = async (body: UserDetails) => {
    try {
      const response = await fetch(
        '/auth/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body)
        }
      )
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error('Invalid API response, check network tab!');
      }
  
      return data;
  
    } catch (err) {
      console.log('Error from user creation: ', err);
      return Promise.reject('Could not create user');
    }
  }
  

// 4. PUT api/users/:id - Update a user by ID
  // Update an existing user via PUT request to the API
  const updateUser = async (id: number | undefined, body: UserDetails) => {
    try {
      const response = await fetch(
        `/api/users/account/update`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body)
        }
      )
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error('Invalid API response, check network tab!');
      }
  
      return data;
  
    } catch (err) {
      console.log('Error from user updating: ', err);
      return Promise.reject('Could not update user');
    }
  }

  // 5. PUT api/users/:id - Update a user by ID  -- Any user in the database (not loggedIn)
  // Update an existing user via PUT request to the API
  const updateSimpleUser = async (id: number | undefined, body: UserDetails) => {
    try {
      const response = await fetch(
        `/api/users/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body)
        }
      )
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error('Invalid API response, check network tab!');
      }
  
      return data;
  
    } catch (err) {
      console.log('Error from user updating: ', err);
      return Promise.reject('Could not update user');
    }
  }

  
  // 6. DELETE api/users/:id - Delete a user by ID - ANY user not LoggedIn user
  // Delete a user by ID via DELETE request to the API
  const deleteSimpleUser = async (id: number | undefined) => {
    try {
      const response = await fetch(
        `/api/users/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      )
  
      if (!response.ok) {
        throw new Error('Invalid API response, check network tab!');
      }
  
      return;
  
    } catch (err) {
      console.log('Error from user deleting: ', err);
      return Promise.reject('Could not delete user');
    }
  }  

  // 6. DELETE api/users/:id - Delete a user by ID
  // Delete a user by ID via DELETE request to the API
  const deleteUser = async () => {
    try {
      const response = await fetch(
        `api/users/remove/recipe/:recipeId`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      )
  
      if (!response.ok) {
        throw new Error('Invalid API response, check network tab!');
      }
  
      return;
  
    } catch (err) {
      console.log('Error from user deleting: ', err);
      return Promise.reject('Could not delete user');
    }
  }  

  export { retrieveUsers, retrieveUser, addUser, updateUser, deleteUser, retrieveSimpleUser, deleteSimpleUser, updateSimpleUser};
  