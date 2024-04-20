import React, { ChangeEvent } from 'react';
import styles from './styles.module.css';

type TInput = {
	className?: string;
	type: React.HTMLInputTypeAttribute | undefined;
	name: string;
	value: any;
	onChange: (evt: ChangeEvent<HTMLInputElement>) => void;
	placeholder?: string;
	required?: boolean;
};

export const Input = ({
	className = '',
	name,
	value,
	type,
	onChange,
	placeholder,
	required = false,
}: TInput) => {
	return (
		<input
			className={`${styles.input} ${className}`}
			onChange={onChange}
			name={name}
			type={type}
			value={value}
			placeholder={placeholder}
			required={required}
		/>
	);
};
