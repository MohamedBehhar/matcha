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
	value,
	onChange,
  }: {
	options: string[];
	placeholder: string;
	name: string;
	value: string;
	onChange?: (value: string) => void;
  }) {
	return (
	  <Select
		name={name}
		value={value} // Controlled value
		onValueChange={(value) => {
		  if (onChange) {
			onChange(value);
		  }
		}}
	  >
		<SelectTrigger>
		  <SelectValue placeholder={placeholder} />
		</SelectTrigger>
		<SelectContent>
		  {options.map((option) => (
			<SelectItem key={option} value={option}>
			  {option}
			</SelectItem>
		  ))}
		</SelectContent>
	  </Select>
	);
  }
  
  export default MySelect;
  