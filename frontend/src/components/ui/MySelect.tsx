import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
  } from "@/components/ui/select";
  function MySelect({
	options,
	placeholder,
	name,
	defaultValue,
	onChange,
  }: {
	options: string[];
	placeholder: string;
	name: string;
	defaultValue: string;
	onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void
  }) {
	return (
	  <Select
	  
		name={name}
		value={defaultValue}
		onChange={onChange}
	  >
		<SelectTrigger >
		  <SelectValue placeholder={placeholder}  />
		</SelectTrigger>
		<SelectContent

		>
		  {options.map((option) => (
			<SelectItem key={option} value={option} 
			>
			  {option}
			</SelectItem>
		  ))}
		</SelectContent>
	  </Select>
	);
  }
  
  export default MySelect;