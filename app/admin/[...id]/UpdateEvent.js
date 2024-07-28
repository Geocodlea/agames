"use client";

import { useState } from "react";
import revalidate from "/utils/revalidate";

import { Formik, Form, Field } from "formik";
import * as Yup from "yup";

import { Box } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";

import {
  CustomTextField,
  CustomSelect,
  CustomFileUpload,
} from "@/utils/formsHelper";
import AlertMsg from "/components/AlertMsg";

import {
  FILE_SIZE,
  FILE_SIZE_TEXT,
  SUPPORTED_FORMATS,
  SUPPORTED_FORMATS_TEXT,
} from "@/utils/helpers";

const initialValues = {
  title: "",
  description: "",
  image: "",
  date: "",
  type: "",
};

const validationSchema = Yup.object().shape({
  title: Yup.string("Title must be a text"),
  description: Yup.string("Description must be a text"),
  image: Yup.mixed()
    .test("fileSize", `${FILE_SIZE_TEXT}`, (value) => {
      if (!value) return true;
      return value.size <= FILE_SIZE;
    })
    .test("fileFormat", `${SUPPORTED_FORMATS_TEXT}`, (value) => {
      if (!value) return true;
      return SUPPORTED_FORMATS.includes(value.type);
    }),
  date: Yup.date("Event date must be a date"),
  type: Yup.string("Event Type must be a text"),
});

const UpdateEvent = ({ params }) => {
  const [alert, setAlert] = useState({ text: "", severity: "" });

  const onSubmit = async (values) => {
    try {
      let formData = new FormData();

      formData.append("title", values.title);
      formData.append("description", values.description);
      formData.append("image", values.image);
      formData.append("date", values.date);
      formData.append("type", values.type);

      const response = await fetch(`/api/events/${params.id}`, {
        method: "PATCH",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success === false) {
        throw new Error(data.message);
      }

      setAlert({ text: "Event updated successfully", severity: "success" });
      revalidate();
    } catch (error) {
      setAlert({ text: `${error}`, severity: "error" });
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {({ isSubmitting }) => (
        <Form>
          <Field
            name="title"
            component={CustomTextField}
            label="Title"
            type="text"
          />

          <Field
            name="description"
            component={CustomTextField}
            label="Description"
            type="text"
            multiline
          />

          <Field
            name="image"
            component={CustomFileUpload}
            label="Image"
            type="file"
            accept="image/*"
            InputLabelProps={{
              shrink: true,
            }}
          />

          <Field
            name="date"
            component={CustomTextField}
            label="Date"
            type="date"
            InputLabelProps={{
              shrink: true,
            }}
          />

          <Field
            name="type"
            component={CustomSelect}
            label="Type"
            options={[
              { value: "catan", label: "Catan" },
              { value: "whist", label: "Whist" },
              { value: "rentz", label: "Rentz" },
              { value: "cavaleri", label: "Catan - Orașe și Cavaleri" },
              { value: "general", label: "General" },
            ]}
          />

          <Box
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <LoadingButton
              type="submit"
              loading={isSubmitting}
              loadingIndicator="Updating..."
              variant="contained"
              className="btn btn-primary"
              sx={{ marginTop: "12px", marginBottom: "20px" }}
            >
              Update event
            </LoadingButton>
            <AlertMsg alert={alert} />
          </Box>
        </Form>
      )}
    </Formik>
  );
};

export default UpdateEvent;
