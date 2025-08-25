import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

export const handleDelete = async (keys, apiUrl, onSuccess) => {
  if (!keys || keys.length === 0) return;

  MySwal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this action!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "Cancel",
    customClass: {
      popup: "rounded-2xl shadow-xl",
      confirmButton: "px-4 py-2 rounded-lg",
      cancelButton: "px-4 py-2 rounded-lg",
    },
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const res = await fetch(`${apiUrl}/${keys[0]}`, {
          method: "DELETE",
        });

        if (res.ok) {
          MySwal.fire("Deleted!", "The item has been deleted.", "success");
          if (onSuccess) onSuccess(); // callback after delete
        } else {
          MySwal.fire("Failed!", "Something went wrong.", "error");
        }
      } catch (err) {
        console.error(err);
        MySwal.fire("Error!", "Server error occurred.", "error");
      }
    }
  });
};
