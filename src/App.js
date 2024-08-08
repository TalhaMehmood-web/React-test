import { useState, useEffect } from "react";
import "./App.css";
import { X, Search } from "lucide-react";
import Checkbox from "./components/checkbox";
import data from "./lib/data";
import { useFormik } from "formik";
import * as Yup from "yup";

function separateItemsByCategory(items) {
  const categorized = {};
  const nonCategorized = [];

  items.forEach((item) => {
    if (item.category) {
      const categoryName = item.category.name;
      if (!categorized[categoryName]) {
        categorized[categoryName] = [];
      }
      categorized[categoryName].push(item);
    } else {
      nonCategorized.push(item);
    }
  });

  return { categorized, nonCategorized };
}

function App() {
  const { categorized, nonCategorized } = separateItemsByCategory(data);
  const [applicableItemsLength, setApplicableItemsLength] = useState(0);
  const formik = useFormik({
    initialValues: {
      name: "",
      rate: "",
      applyTo: "some",
      applicableItems: [],
      selectAllNonCategorized: false,
      selectAllCategorized: {},
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Required"),
      rate: Yup.number()
        .required("Required")
        .positive("Must be positive")
        .max(100, "Max 100%"),
    }),
    onSubmit: (values) => {
      const rate = parseFloat(values.rate) / 100;
      console.log({
        name: values.name,
        rate: rate.toFixed(2),
        applied_to: values.applyTo,
        applicable_items: values.applicableItems,
      });
    },
  });
  useEffect(() => {
    setApplicableItemsLength(formik.values.applicableItems.length);
  }, [formik.values.applicableItems]);
  const handleSelectAll = (event) => {
    const isChecked = event.target.checked;
    const allItems = Object.keys(categorized)
      .flatMap((category) => categorized[category].map((item) => item.id))
      .concat(nonCategorized.map((item) => item.id));

    if (isChecked) {
      formik.setFieldValue("applicableItems", allItems);
      formik.setFieldValue("selectAllNonCategorized", true);
      formik.setFieldValue(
        "selectAllCategorized",
        Object.keys(categorized).reduce((acc, key) => {
          acc[key] = true;
          return acc;
        }, {})
      );
    } else {
      formik.setFieldValue("applicableItems", []);
      formik.setFieldValue("selectAllNonCategorized", false);
      formik.setFieldValue(
        "selectAllCategorized",
        Object.keys(categorized).reduce((acc, key) => {
          acc[key] = false;
          return acc;
        }, {})
      );
    }
  };

  const handleSelectAllNonCategorized = (event) => {
    const isChecked = event.target.checked;
    const nonCategorizedIds = nonCategorized.map((item) => item.id);

    if (isChecked) {
      formik.setFieldValue("selectAllNonCategorized", true);
      formik.setFieldValue("applicableItems", [
        ...formik.values.applicableItems,
        ...nonCategorizedIds,
      ]);
    } else {
      formik.setFieldValue("selectAllNonCategorized", false);
      formik.setFieldValue(
        "applicableItems",
        formik.values.applicableItems.filter(
          (itemId) => !nonCategorizedIds.includes(itemId)
        )
      );
    }
  };

  const handleSelectCategory = (category, isChecked) => {
    const categoryItems = categorized[category].map((item) => item.id);

    if (isChecked) {
      formik.setFieldValue("applicableItems", [
        ...formik.values.applicableItems,
        ...categoryItems,
      ]);
      formik.setFieldValue("selectAllCategorized", {
        ...formik.values.selectAllCategorized,
        [category]: true,
      });
    } else {
      formik.setFieldValue(
        "applicableItems",
        formik.values.applicableItems.filter(
          (itemId) => !categoryItems.includes(itemId)
        )
      );
      formik.setFieldValue("selectAllCategorized", {
        ...formik.values.selectAllCategorized,
        [category]: false,
      });
    }
  };

  return (
    <div className="min-h-screen w-full py-2 flex justify-center">
      <div className="flex flex-col w-[50%]">
        <form onSubmit={formik.handleSubmit}>
          <div className="flex w-full justify-between items-center">
            <p className="text-2xl font-semibold text-[#373737]">Add Tax</p>
            <X className="cursor-pointer" />
          </div>
          <div className="my-4 w-[90%] flex space-x-2">
            <input
              type="text"
              name="name"
              className="outline-none p-2 rounded-md border border-[#E2E8F0] w-[60%]"
              placeholder="tax in letters"
              onChange={formik.handleChange}
              value={formik.values.name}
            />
            {formik.touched.name && formik.errors.name ? (
              <div>{formik.errors.name}</div>
            ) : null}
            <div className="border border-[#E2E8F0] flex justify-between items-center p-2 rounded-md">
              <input
                type="text"
                name="rate"
                className="outline-none"
                placeholder="tax %"
                onChange={formik.handleChange}
                value={formik.values.rate}
              />
              <span>%</span>
            </div>
            {formik.touched.rate && formik.errors.rate ? (
              <div>{formik.errors.rate}</div>
            ) : null}
          </div>
          <div>
            <Checkbox
              id={"all"}
              name="applyTo"
              label={"Apply to all items in collection"}
              checkboxClass={"custom-checkbox-box1"}
              checked={formik.values.applyTo === "all"}
              onChange={() => {
                formik.setFieldValue("applyTo", "all");
                handleSelectAll({ target: { checked: true } });
              }}
            />
            <Checkbox
              id={"some"}
              name="applyTo"
              label={"Apply to specific items"}
              checked={formik.values.applyTo === "some"}
              checkboxClass={"custom-checkbox-box1"}
              onChange={() => {
                formik.setFieldValue("applyTo", "some");
                handleSelectAll({ target: { checked: false } });
              }}
            />
          </div>
          <div className="border flex flex-col my-4 p-4 border-x-0 border-y-[#b9b9b9]">
            <div className="flex items-center border space-x-2 border-[#E2E8F0] w-1/3 px-2 rounded-md">
              <Search className="" color="#E2E8F0" />
              <input
                type="search"
                className="outline-none border-none p-2"
                placeholder="Search Items"
              />
            </div>
            {Object.keys(categorized).map((category) => (
              <div key={category} className="mt-4 flex flex-col space-y-3">
                <div className="flex items-center space-x-2 bg-[#EEEEEE] p-2 rounded">
                  <Checkbox
                    id={category}
                    label={category}
                    checkboxClass={"custom-checkbox-box2"}
                    checked={formik.values.selectAllCategorized[category]}
                    onChange={(event) =>
                      handleSelectCategory(category, event.target.checked)
                    }
                  />
                </div>
                {categorized[category].map((item) => (
                  <div
                    key={item.id}
                    className="ml-4 flex items-center space-x-2"
                  >
                    <Checkbox
                      id={item.id}
                      label={item.name}
                      checkboxClass={"custom-checkbox-box2"}
                      checked={formik.values.applicableItems.includes(item.id)}
                      onChange={(event) => {
                        const isChecked = event.target.checked;
                        if (isChecked) {
                          formik.setFieldValue("applicableItems", [
                            ...formik.values.applicableItems,
                            item.id,
                          ]);
                        } else {
                          formik.setFieldValue(
                            "applicableItems",
                            formik.values.applicableItems.filter(
                              (id) => id !== item.id
                            )
                          );
                        }
                      }}
                    />
                  </div>
                ))}
              </div>
            ))}
            {nonCategorized.length > 0 && (
              <div className="mt-4 flex flex-col space-y-3">
                <div className="flex items-center space-x-2 bg-[#EEEEEE] p-2 rounded">
                  <Checkbox
                    id={"nonCategorized"}
                    label={""}
                    checkboxClass={"custom-checkbox-box2"}
                    checked={formik.values.selectAllNonCategorized}
                    onChange={handleSelectAllNonCategorized}
                    className={"pr-2 py-2"}
                  />
                </div>
                {nonCategorized.map((item) => (
                  <div
                    key={item.id}
                    className="ml-4 flex items-center space-x-2"
                  >
                    <Checkbox
                      id={item.id}
                      label={item.name}
                      checkboxClass={"custom-checkbox-box2"}
                      checked={formik.values.applicableItems.includes(item.id)}
                      onChange={(event) => {
                        const isChecked = event.target.checked;
                        if (isChecked) {
                          formik.setFieldValue("applicableItems", [
                            ...formik.values.applicableItems,
                            item.id,
                          ]);
                        } else {
                          formik.setFieldValue(
                            "applicableItems",
                            formik.values.applicableItems.filter(
                              (id) => id !== item.id
                            )
                          );
                        }
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="w-full flex justify-end">
            <button
              type="submit"
              className="bg-[#F16D36] text-white p-3 rounded-md cursor-pointer hover:bg-[#f16e36e5] transition-all duration-200"
            >
              Apply tax to{" "}
              {applicableItemsLength !== 0 && applicableItemsLength} item(s)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;
