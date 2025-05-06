import auth from "@/utils_graphQL/auth"
import { useLocation } from "react-router-dom"
import { useEffect, useState } from "react"
import { useMutation, useLazyQuery } from "@apollo/client"
import { GET_ACCOUNT_PREFERENCES } from "@/utils_graphQL/queries"
import { UPDATE_ACCOUNT_PREFERENCES } from "@/utils_graphQL/mutations"
import { DELETE_USER } from "@/utils_graphQL/mutations"
import localStorageService from "@/utils_graphQL/localStorageService"
import { toast } from "sonner"
import DietForm from "./DietForm"
import type { DietaryNeeds } from "@/types"
import { isEqual } from "lodash"
import DeleteAccountModal from "./DeleteAccountModal"

export default function DashBoard() {
  const [dietNeeds, setDietNeeds] = useState<DietaryNeeds>(localStorageService.getAccountDiet())
  const [fetchDiet, { data }] = useLazyQuery(GET_ACCOUNT_PREFERENCES)
  const [updateAccount] = useMutation(UPDATE_ACCOUNT_PREFERENCES)
  const [deleteUser] = useMutation(DELETE_USER)
  const location = useLocation()
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  useEffect(() => {
    if (localStorageService.isAccountDietExpired()) {
      fetchDiet()
    }
  }, [location.pathname])

  useEffect(() => {
    if (!data) {
      return
    }
    const FetchedDietNeeds: DietaryNeeds = data.getUser
    localStorageService.setAccountDiet(FetchedDietNeeds)

    if (!isEqual(dietNeeds, FetchedDietNeeds)) {
      setDietNeeds(FetchedDietNeeds)
    }
  }, [data])

  const handleLogOut = () => {
    auth.logout()
  }

  const handleAccountUpdate = async (updatedDiet: DietaryNeeds) => {
    try {
      const { data, errors } = await updateAccount({
        variables: {
          diet: updatedDiet.diet,
          intolerances: updatedDiet.intolerances,
        },
      })

      if (!data || errors) {
        console.error("soething went wrong")
        return
      }

      localStorageService.setAccountDiet(updatedDiet)
      localStorageService.removeFilter()
      setDietNeeds(updatedDiet)

      // Show success toast with custom styling
      toast.success("Preferences updated", {
        description: "Your dietary preferences have been successfully saved.",
        dismissible: true,
        icon: "🍽️",
      })
    } catch (error) {
      console.error("Error updating preferences:", error)
      toast.error("Update failed", {
        description: "There was a problem updating your preferences.",
        dismissible: true,
      })
    }
  }

  const handleDeleteUser = async () => {
    try {
      const { data } = await deleteUser()

      if (data?.deleteUser?._id) {
        // Show success toast for account deletion
        toast.success("Account deleted", {
          description: "Your account has been successfully deleted.",
          dismissible: true,
          icon: "👋",
        })

        // Log the user out but don't navigate away immediately
        auth.deleteAccount()

        // Optional: You could add a slight delay before navigation if you want
        // the user to see the toast before being redirected
        setTimeout(() => {
          window.location.reload()
        }, 3000)
      } else {
        // Show error toast for failed deletion
        toast.error("Delete failed", {
          description: "Failed to delete account. Please try again.",
          dismissible: true,
        })
      }
    } catch (error) {
      console.error("Error deleting account:", error)
      // Show error toast for exceptions
      toast.error("Delete failed", {
        description: "There was an issue deleting your account. Please try again.",
        dismissible: true,
      })
    }
  }

  return (
    <>
      <h2 className="text-2xl font-bold mb-6 text-center text-[#a84e24]">Dietary Preferences</h2>

      <p className="text-sm text-[#6B2A29] text-center mb-4">
        Register your preferences for use in recipe search filters.
      </p>

      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-6">
        <DietForm formValues={dietNeeds} handleAccountUpdate={handleAccountUpdate}></DietForm>

        <div className="mt-6">
          <button
            onClick={handleLogOut}
            id="log-out-button"
            className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
          >
            Log out
          </button>
        </div>

        <div className="mt-6">
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            id="delete-account-button"
            className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
          >
            Delete Account
          </button>
        </div>
      </div>

      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => {
          setIsDeleteModalOpen(false)
          handleDeleteUser()
        }}
      />
    </>
  )
}
