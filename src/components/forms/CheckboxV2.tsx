import React from 'react';
import styled from 'styled-components';

interface CheckboxOption {
    label: string;
    value: string;
  }

interface CheckboxProps {
  name: string;
  options: CheckboxOption[];
  selectedValue?: string;
  onChange: any;
  className?: any;
  touched?: any;
  errors?: any;
  onBlur?: any;
  isShowLabel?: boolean;
  label?: string;
  value?: string;
  selectedValues: string[];
}

const CheckboxContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  position: relative;
`;

const CheckboxOptionLabel = styled.label`
  color: rgba(0,0,0,0.75);
    display: block;
    position: relative;
    padding-left: 20px;
    line-height: 20px;
    margin-bottom: 12px;
    margin-left: 10px;
    cursor: pointer;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    font-size: 12px;
    line-height: 13px;

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
    border: 1px solid rgba(0,0,0,0.25);
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

const Checkbox = (props: CheckboxProps) => {

    const {
        className = "",
        isShowLabel = true,
        label,
        selectedValues,
        name,
        selectedValue,
        options = [],
        value,
        touched,
        errors,
        onChange,
        onBlur,

    } = props;

  return (
    <CheckboxContainer className={className}>
      {isShowLabel && (
        <div className="text-xs font-semibold pb-2 flex items-center">
            <label htmlFor={name}>{label ? label : name}</label>
        </div>
      )}
      <CheckboxGroup>
        {options.map((option, index) => (
          <CheckboxOptionLabel htmlFor={`opt${index.toString()}`} className='text-xs font-medium text-gray-900' key={option.value}>
            {option.label}
            <CheckboxInput
              id={`opt${index.toString()}`}
              type="checkbox"
              name={name}
              value={option.value}
              checked={selectedValues?.includes(option.value)}
              onChange={onChange}
              onBlur={onBlur}
            />
            <CheckboxCustomSelect>
            <svg width="9" height="8" viewBox="0 0 9 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1.5 4L4 6.5L9 1.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            </CheckboxCustomSelect>
          </CheckboxOptionLabel>
        ))}
      </CheckboxGroup>
    </CheckboxContainer>
  );
};

export default Checkbox;
