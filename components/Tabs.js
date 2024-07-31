"use client";

import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";

function CustomTabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <div>{children}</div>
        </Box>
      )}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function tabsProps(index) {
  return {
    id: `tab-${index}`,
    "aria-controls": `tabpanel-${index}`,
  };
}

export default function CustomTabs({ tabContents, round }) {
  const initialValue = round === 0 ? 3 : 4;
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [round]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <div>
      <Tabs
        value={value}
        onChange={handleChange}
        variant="scrollable"
        scrollButtons
        allowScrollButtonsMobile
        aria-label="event tabs"
        sx={{
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        {tabContents.map((tab, i) => (
          <Tab label={tab.label} {...tabsProps(i)} key={i} />
        ))}
      </Tabs>

      {tabContents.map((tab, i) => (
        <CustomTabPanel value={value} index={i} key={i}>
          {tab.content}
        </CustomTabPanel>
      ))}
    </div>
  );
}
