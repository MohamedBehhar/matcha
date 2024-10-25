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
  }: {
	options: string[];
	placeholder: string;
  }) {
	return (
	  <Select className="">
		<SelectTrigger className="">
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