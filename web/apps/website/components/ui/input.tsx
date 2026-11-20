"use client";

import { Input as ZenthInput } from "@company/react";
import * as React from "react";

export interface InputProps
	extends Omit<React.ComponentPropsWithoutRef<"input">, "size"> {
	/** Validation message; the design system applies the error styling. */
	errorMessage?: string;
}

/**
 * Site-facing adapter over the design-system Input.
 *
 * The design system owns the control surface, focus ring, disabled state and
 * error treatment. The site keeps its `errorMessage` convenience prop.
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
	function Input({ errorMessage, ...props }, ref) {
		return <ZenthInput ref={ref} error={errorMessage} {...props} />;
	},
);

Input.displayName = "Input";

export const NumberInput = React.forwardRef<HTMLInputElement, InputProps>(
	function NumberInput(props, ref) {
		return <Input ref={ref} type="text" inputMode="numeric" {...props} />;
	},
);

NumberInput.displayName = "NumberInput";
