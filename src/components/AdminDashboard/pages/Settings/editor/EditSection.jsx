import React, { useEffect, useRef, useState } from "react";
import Quill from "quill";
import { useLocation, useNavigate } from "react-router-dom";
import Editor from "./Editor";
import { useGetPrivacyPolicyQuery, useUpdatePolicesMutation } from "../../../../../redux/slices/Apis/dashboardApis";
import Swal from "sweetalert2";

const Delta = Quill.import("delta");

const EditSection = ({ data,type }) => {
  const [range, setRange] = useState();
  const [lastChange, setLastChange] = useState();
  const [readOnly, setReadOnly] = useState(false);
  const location = useLocation();
  const [previewHTML, setPreviewHTML] = useState("");
  const navigate = useNavigate();
  const [updatePolices] = useUpdatePolicesMutation();
   const { data: privacy,refetch } = useGetPrivacyPolicyQuery();

  const quillRef = useRef(null);

  useEffect(() => {
    if (location.pathname === "/settings") {
      navigate("/settings/privacy");
    }
  }, [location.pathname]);

  const text = data;

  const handleLogContent = async () => {
    if (quillRef.current) {
      const html = quillRef.current.root.innerHTML;

      // ✅ Build payload for API
      const payload = {
        title: "Privacy Policy", // Or dynamic if you want
        type: type, // Or "privacy" depending on your case
        content: html,
      };

      try {
        const res = await updatePolices(payload).unwrap();
        // console.log("✅ Updated successfully:", res);
        refetch()
        Swal.fire("Success!", "Policy updated successfully", "success");
        setPreviewHTML(html); // Show preview after success
      } catch (error) {
        console.error("❌ Update failed:", error);
        Swal.fire("Error!", "Failed to update policy", "error");
      }
    }
  };

  return (
    <div className="settings-container">
      <Editor
        ref={quillRef}
        readOnly={readOnly}
        defaultValue={new Delta().insert(text)}
        onSelectionChange={setRange}
        onTextChange={setLastChange}
      />

      <div className="settings-controls">
        <button
          className="get-length-btn text-white mt-7 popbold w-[153px] h-[40px] bg-[#2765A1]"
          onClick={handleLogContent}
        >
          Update
        </button>
      </div>

      {previewHTML && (
        <div className="preview-container mt-10">
          <h3 className="preview-title">📄 Preview:</h3>
          <div
            className="preview-content"
            dangerouslySetInnerHTML={{ __html: previewHTML }}
          />
        </div>
      )}
    </div>
  );
};

export default EditSection;
