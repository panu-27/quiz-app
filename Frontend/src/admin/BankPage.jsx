/**
 * BankPage.jsx  →  /admin/bank
 * Wraps CustomFormView (Question Bank) inside AdminLayout.
 */
import React from "react";
import CustomFormView from "./CreateTest/CustomFormView";

export default function BankPage() {
  return (
    <>
      <CustomFormView />
    </>
  );
}
