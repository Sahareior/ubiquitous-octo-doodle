import React, { useEffect, useRef, useState } from "react";
import Quill from "quill";
import { useLocation, useNavigate } from "react-router-dom";
import Editor from "./Editor";
import { useGetPrivacyPolicyQuery, useUpdatePolicesMutation } from "../../../../../redux/slices/Apis/dashboardApis";
import Swal from "sweetalert2";

const Delta = Quill.import("delta");

const EditSection = ({ data, type }) => {
  const [range, setRange] = useState();
  const [lastChange, setLastChange] = useState();
  const [readOnly, setReadOnly] = useState(false);
  const location = useLocation();
  const [previewHTML, setPreviewHTML] = useState("");
  const navigate = useNavigate();
  const [updatePolices] = useUpdatePolicesMutation();
  const { data: privacy, refetch } = useGetPrivacyPolicyQuery();

  const quillRef = useRef(null);
  const [initialContent, setInitialContent] = useState(null);

  useEffect(() => {
    if (location.pathname === "/settings") {
      navigate("/settings/privacy");
    }
  }, [location.pathname]);

  // Convert HTML to Delta when data changes
  useEffect(() => {
    if (data && quillRef.current) {
      try {
        // Method 1: Use Quill's clipboard to convert HTML to Delta
        const delta = quillRef.current.clipboard.convert({ html: data });
        quillRef.current.setContents(delta);
        setPreviewHTML(data); // Set initial preview
      } catch (error) {
        console.error("Error converting HTML to Delta:", error);
        // Fallback: Insert as plain text
        quillRef.current.setText(data);
      }
    }
  }, [data, quillRef.current]);

  const handleLogContent = async () => {
    if (quillRef.current) {
      const html = quillRef.current.root.innerHTML;

      // ✅ Build payload for API
      const payload = {
        title: "Privacy Policy",
        type: type,
        content: html,
      };

      try {
        const res = await updatePolices(payload).unwrap();
        refetch();
        Swal.fire("Success!", "Policy updated successfully", "success");
        setPreviewHTML(html);
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
        defaultValue={initialContent} // Pass null initially, will set via useEffect
        onSelectionChange={setRange}
        onTextChange={setLastChange}
      />

      <div className="settings-controls flex justify-end">
        <button
          className="get-length-btn text-white mt-16 popbold w-[153px] h-[40px] bg-[#2765A1]"
          onClick={handleLogContent}
        >
          Update
        </button>
      </div>

    </div>
  );
};

export default EditSection;