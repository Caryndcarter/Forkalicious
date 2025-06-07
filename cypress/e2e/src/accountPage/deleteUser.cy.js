export default function runUserDelete() {
    describe('Account Deletion', () => {
        it('should delete the user account, log the user out, and redirect to the home page', () => {
          // Visit the user-info page
          cy.visit('/user-info'); 
      
          // Stub the deleteUser API call to simulate successful user deletion
          cy.intercept('POST', '/graphql', (req) => {
            if (req.body.operationName === 'deleteUser') {
              req.reply({
                data: {
                  deleteUser: {
                    _id: '12345', // Simulate the deleted user's ID being returned
                    userEmail: 'user@example.com', // Simulate additional user data as needed
                  },
                },
              });
            }
          }).as('deleteUserMutation');
      
          cy.get('#delete-account-button').click();
      
          // Wait for the mutation to complete
          cy.wait('@deleteUserMutation');
      
          // Check if the user is redirected to the home page
          cy.url().should('include', '/'); 
    
        });
      });
      
    }


 runUserDelete();