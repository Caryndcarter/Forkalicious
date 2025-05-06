import { X } from "lucide-react"

interface DeleteAccountModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export default function DeleteAccountModal({ isOpen, onClose, onConfirm }: DeleteAccountModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
        <button onClick={onClose} className="absolute right-4 top-4 rounded-full p-1 text-gray-500 hover:bg-gray-100">
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6 text-center">
          <h3 className="text-xl font-bold text-[#a84e24] mb-2">Delete Account</h3>
          <p className="text-sm text-[#6B2A29]">
            Are you sure you want to delete your account? This action cannot be undone and all your data will be
            permanently removed.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 sm:flex-initial bg-gray-200 text-gray-800 py-2 px-6 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 sm:flex-initial bg-red-600 text-white py-2 px-6 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  )
}
