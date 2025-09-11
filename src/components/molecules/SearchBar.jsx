import ApperIcon from "@/components/ApperIcon";
import Input from "@/components/atoms/Input";

const SearchBar = ({ 
  placeholder = "Search...",
  value,
  onChange,
  className = "",
  showSearchButton = false,
  onSearchClick,
  onKeyDown
}) => {
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && onSearchClick) {
      e.preventDefault();
      onSearchClick();
    }
    if (onKeyDown) {
      onKeyDown(e);
    }
  };
return (
    <div className={`relative ${className}`}>
      <ApperIcon 
        name="Search" 
        size={20} 
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" 
      />
<Input
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        className={`pl-10 ${showSearchButton ? 'pr-12' : ''}`}
      />
      {showSearchButton && (
        <button
          onClick={onSearchClick}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-md transition-colors"
          type="button"
        >
          <ApperIcon 
            name="Search" 
            size={16} 
            className="text-gray-500 hover:text-gray-700" 
          />
        </button>
      )}
    </div>
  );
};

export default SearchBar;