import { useState, useRef } from "react";
import { default as ReactSelect, components, InputAction, StylesConfig } from "react-select";
import { ToolTipIcon } from "../ui-components";
const infoCircle = "/assets/icons/info-circle.svg";
import styled from 'styled-components';

export type Option = {
  value: number | string;
  label: string;
};

const CheckboxOptionLabel = styled.label`
  color: rgba(0,0,0,0.75);
    display: block;
    position: relative;
    padding-left: 25px;
    line-height: 20px;
    margin-bottom: 12px;
    margin-left: 10px;
    cursor: pointer;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;

    &:first-child {
        margin-left: 0px;
    }
`;

const CheckboxCustomSelect = styled.span`
position: absolute;
    top: 0;
    left: 0;
    height: 13px;
    width: 13px;
    background-color: rgba(0,0,0,0);
    border: 2px solid rgba(0,0,0,0.25);
    transition: all 0.3s;
    border-radius: 0.25rem;

    & svg{
      position: relative;
      top: 50%;
      transform: translateY(-50%);
      margin: 0 auto;
      display: none;
    }
`;

const CheckboxInput = styled.input`
    position: absolute;
    cursor: pointer;
    display: none;


  &:focus {
    border-color: #db6443;
  }

  &:checked ~ span {
    background-color: #db6443;
    border-color: #db6443;
  }

  &:checked ~ span svg{
    display: block;
  }
  
`;

// Custom Checkbox Component
const CustomCheckbox = ({ checked, onChange }: any) => (
  <CheckboxOptionLabel className="checkbox-container" style={{display:"inline-block", marginRight:"10px"}}>
    <CheckboxInput type="checkbox" checked={checked} onChange={onChange} style={{display:"none"}} />
    <CheckboxCustomSelect className="checkmark">
      <svg width="9" height="8" viewBox="0 0 9 8" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1.5 4L4 6.5L9 1.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </CheckboxCustomSelect>
  </CheckboxOptionLabel>
);

const MultiSelect = (props: any) => {
  const [selectInput, setSelectInput] = useState<string>("");
  const isAllSelected = useRef<boolean>(false);
  const selectAllLabel = useRef<string>("Select all");
  const allOption = { value: "*", label: selectAllLabel.current };

  const {
    style = {},
    isShowLabel = true,
    name,
    icon,
    touched,
    errors,
    isMulti = false,
} = props;

  const filterOptions = (options: Option[], input: string) =>
    options?.filter(({ label }: Option) =>
      label?.toLowerCase().includes(input.toLowerCase())
    );

  const comparator = (v1: Option, v2: Option) =>
    (v1.value as number) - (v2.value as number);

  let filteredOptions = filterOptions(props.options, selectInput);
  let filteredSelectedOptions = filterOptions(props.value, selectInput);

  // const Option = (props: any) => (
  //   <components.Option {...props}>
  //     {props.value === "*" &&
  //     !isAllSelected.current &&
  //     filteredSelectedOptions?.length > 0 ? (
  //       <input
  //         key={props.value}
  //         type="checkbox"
  //         ref={(input) => {
  //           if (input) input.indeterminate = true;
  //         }}
  //       />
  //     ) : (
  //       <input
  //         key={props.value}
  //         type="checkbox"
  //         checked={props.isSelected || isAllSelected.current}
  //         onChange={() => {}}
  //       />
  //     )}
  //     <label style={{ marginLeft: "5px" }}>{props.label}</label>
  //   </components.Option>
  // );

  const Option = (props: any) => (
    <components.Option {...props}>
      {props.value === "*" &&
      !isAllSelected.current &&
      filteredSelectedOptions?.length > 0 ? (
        <CustomCheckbox
          checked={false}
          onChange={() => {}}
          ref={(input:any) => {
            if (input) input.indeterminate = true;
          }}
        />
      ) : (
        <CustomCheckbox
          checked={props.isSelected || isAllSelected.current}
          onChange={() => {}}
        />
      )}
      <label style={{ marginLeft: "5px" }}>{props.label}</label>
    </components.Option>
  );

  const Input = (props: any) => (
    <>
      {selectInput.length === 0 ? (
        <components.Input autoFocus={props.selectProps.menuIsOpen} {...props}>
          {props.children}
        </components.Input>
      ) : (
        <div style={{ border: "1px dotted gray" }}>
          <components.Input autoFocus={props.selectProps.menuIsOpen} {...props}>
            {props.children}
          </components.Input>
        </div>
      )}
    </>
  );

  const customFilterOption = ({ value, label }: Option, input: string) =>
    (value !== "*" && label.toLowerCase().includes(input.toLowerCase())) ||
    (value === "*" && filteredOptions?.length > 0);

  const onInputChange = (
    inputValue: string,
    event: { action: InputAction }
  ) => {
    if (event.action === "input-change") setSelectInput(inputValue);
    else if (event.action === "menu-close" && selectInput !== "")
      setSelectInput("");
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if ((e.key === " " || e.key === "Enter") && !selectInput)
      e.preventDefault();
  };

  const handleChange = (selected: Option[]) => {
    if (
      selected.length > 0 &&
      !isAllSelected.current &&
      (selected[selected.length - 1].value === allOption.value ||
        JSON.stringify(filteredOptions) ===
          JSON.stringify(selected.sort(comparator)))
    )
      return props.onChange(
        [
          ...(props.value ?? []),
          ...props.options.filter(
            ({ label }: Option) =>
              label.toLowerCase().includes(selectInput?.toLowerCase()) &&
              (props.value ?? []).filter((opt: Option) => opt.label === label)
                .length === 0
          ),
        ].sort(comparator),
        name
      );
    else if (
      selected.length > 0 &&
      selected[selected.length - 1].value !== allOption.value &&
      JSON.stringify(selected.sort(comparator)) !==
        JSON.stringify(filteredOptions)
    )
      return props.onChange(selected,name);
    else
      return props.onChange([
        ...props.value?.filter(
          ({ label }: Option) =>
            !label?.toLowerCase().includes(selectInput?.toLowerCase())
        ),
      ],name);
  };

  const customStyles = {
    multiValueLabel: (def: any) => ({
      ...def,
      backgroundColor: "lightgray",
    }),
    multiValueRemove: (def: any) => ({
      ...def,
      backgroundColor: "lightgray",
    }),
    valueContainer: (base: any) => ({
      ...base,
      maxHeight: "65px",
      overflow: "auto",
    }),
    option: (styles: any, { isSelected, isFocused}: any) => {
      return {
        ...styles,
        backgroundColor:
          isSelected && !isFocused
            ? null
            : isFocused && !isSelected
            ? "#db6443 !important"
            : isFocused && isSelected
            ? null
            : isFocused
            ? "#db6443 !important"
            : null,
        color: isSelected ? null : null,
      };
    },
    menu: (def: any) => ({ ...def, zIndex: 9999 }),
  };

  const customStyles1: StylesConfig<any> = {
    control: (styles, state) => ({
        ...styles,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        borderWidth: 2,
        minHeight: 36,
        borderColor: state.isFocused
            ? "#db6443"
            : touched?.[name] && errors?.[name]
                ? "#E7515A"
                : "#D8D8D8",
        borderRadius: 6,
        paddingLeft: icon ? 30 : 5,
        boxShadow: "none",
        "&:hover": {
            outlineWidth: 0,
        },
        ...style,
    }),
    singleValue: (styles, state) => ({
        ...styles,
        color: state?.data?.value ? "#13151F" : "rgb(133,133,133)",
        ...style,
    }),
    indicatorsContainer: (styles) => ({
        ...styles,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        ...style,
    }),
    dropdownIndicator: (styles) => ({
        ...styles,
        padding: "6px 8px 6px 8px",
        ...style,
    }),
    clearIndicator: (styles) => ({
        ...styles,
        padding: "6px 8px 6px 8px",
        ...style,
    }),
    indicatorSeparator: (styles) => ({
        ...styles,
        display: "none",
        ...style,
    }),
    groupHeading: (styles) => {
        return {
            ...styles,
            color: "#13151F",
            fontWeight: 700,
            fontSize: "10px",
            ...style,
        };
    },
    menuList: (styles) => ({
        ...styles,
        borderWidth: 2,
        borderColor: "#db6443",
        borderRadius: 6,
        padding: 0,
        ...style,
    }),
  };

  const combinedCustomStyles: StylesConfig<any> = {
    ...customStyles1,
    ...customStyles,
  };

  if (props.isSelectAll && props.options.length !== 0) {
    isAllSelected.current =
      JSON.stringify(filteredSelectedOptions) ===
      JSON.stringify(filteredOptions);

    if (filteredSelectedOptions?.length > 0) {
      if (filteredSelectedOptions?.length === filteredOptions?.length)
        selectAllLabel.current = `All (${filteredOptions.length}) selected`;
      else
        selectAllLabel.current = `${filteredSelectedOptions?.length} / ${filteredOptions.length} selected`;
    } else selectAllLabel.current = "Select all";

    allOption.label = selectAllLabel.current;

    return (
      <>
      <div>
        {isShowLabel && (
          <div className="text-xs font-semibold pb-2 flex items-center">
              <label htmlFor={props.name}>{props.label ? props.label : props.name}</label>
              {props.isInfo && (
                  <ToolTipIcon
                    tooltip={props.label ? props.label : props.name}
                    className="ml-3 cursor-pointer"
                    src={infoCircle}
                    width={18}
                    height={18}
                    alt={props.label ? props.label : props.name}
                  />
              )}
          </div>
        )}
        <div className="flex flex-row items-center relative">
          <ReactSelect
            {...props}
            inputValue={selectInput}
            onInputChange={onInputChange}
            onKeyDown={onKeyDown}
            options={[allOption, ...props.options]}
            onChange={handleChange}
            components={{
              Option: Option,
              Input: Input,
              ...props.components,
            }}
            filterOption={customFilterOption}
            menuPlacement={props.menuPlacement ?? "auto"}
            styles={combinedCustomStyles}
            isMulti
            closeMenuOnSelect={false}
            tabSelectsValue={false}
            backspaceRemovesValue={false}
            hideSelectedOptions={false}
            blurInputOnSelect={false}
            placeholder="Select User"
            className="w-full text-xs"
          />
        </div>
      </div>
      </>
    );
  }

  return (
    <ReactSelect
      {...props}
      inputValue={selectInput}
      onInputChange={onInputChange}
      filterOption={customFilterOption}
      components={{
        Input: Input,
        ...props.components,
      }}
      menuPlacement={props.menuPlacement ?? "auto"}
      onKeyDown={onKeyDown}
      tabSelectsValue={false}
      hideSelectedOptions={true}
      backspaceRemovesValue={false}
      blurInputOnSelect={true}
      placeholder="Select Users"
    />
  );
};

export default MultiSelect;
