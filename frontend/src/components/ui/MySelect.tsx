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
  }: {
	options: string[];
	placeholder: string;
	name: string;
	defaultValue: string;
  }) {
	return (
	  <Select
	  
		name={name}
		value={defaultValue}
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