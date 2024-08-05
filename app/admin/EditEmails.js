"use client";

import { useState } from "react";
import { Formik, Form, Field } from "formik";

import dynamic from "next/dynamic";
const Editor = dynamic(() => import("@/components/Editor"), { ssr: false });

import { CustomSelect, CustomTextField } from "@/utils/formsHelper";
import AlertMsg from "/components/AlertMsg";

const initialValues = {
  name: "",
  subject: "",
};

const EditEmails = () => {
  const [emails, setEmails] = useState([]);
  const [alert, setAlert] = useState({ text: "", severity: "" });

  const getEmails = async (name) => {
    const data = await fetch(`/api/emails/${name}`);
    const result = await data.json();

    setEmails(result);
  };

  const saveData = async (text, tab) => {
    try {
      const response = await fetch(`/api/emails/${emails.name}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          tab,
        }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      setAlert({
        text: `Saved`,
        severity: "success",
      });
    } catch (error) {
      setAlert({ text: `${error}`, severity: "error" });
    }
  };

  return (
    <Formik initialValues={initialValues}>
      {({ setFieldValue }) => (
        <Form>
          <Field
            name="name"
            component={CustomSelect}
            label="Email"
            options={[
              { value: "register", label: "Inscriere Eveniment" },
              { value: "start", label: "Start Runda" },
              { value: "footer", label: "Footer Email" },
            ]}
            onChange={(e) => {
              setFieldValue("name", e.target.value);
              getEmails(e.target.value);
            }}
          />

          <Field
            name="subject"
            component={CustomTextField}
            label="Subject"
            type="text"
            placeholder={emails?.subject}
            InputLabelProps={{
              shrink: true,
            }}
            onBlur={(e) => {
              setFieldValue("subject", e.target.value);
              saveData(e.target.value, "subject");
            }}
          />

          <Editor saveData={saveData} initialData={emails.body} tab={"body"} />
          <AlertMsg alert={alert} />
        </Form>
      )}
    </Formik>
  );
};

export default EditEmails;
