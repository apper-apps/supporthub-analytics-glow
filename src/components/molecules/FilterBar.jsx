import SearchBar from "@/components/molecules/SearchBar";
import Select from "@/components/atoms/Select";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const FilterBar = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  filters = [],
  showExport = false,
  onExport,
  showRefresh = false,
  onRefresh,
  showSearchButton = false,
  onSearchClick,
  children
}) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
<div className="flex flex-col sm:flex-row gap-4 flex-1">
          <SearchBar
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={onSearchChange}
            className="flex-1 max-w-md"
            showSearchButton={showSearchButton}
            onSearchClick={onSearchClick}
          />
          
          <div className="flex gap-3">
            {filters.map((filter, index) => (
              <Select
                key={index}
                value={filter.value}
                onChange={filter.onChange}
                className="min-w-[140px]"
              >
                <option value="">{filter.placeholder}</option>
                {filter.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            ))}
          </div>
        </div>
        
        <div className="flex gap-3">
          {showRefresh && (
            <Button
              variant="ghost"
              size="default"
              onClick={onRefresh}
            >
              <ApperIcon name="RefreshCw" size={16} className="mr-2" />
              Refresh
            </Button>
          )}
          
          {showExport && (
            <Button
              variant="outline"
              size="default"
              onClick={onExport}
            >
              <ApperIcon name="Download" size={16} className="mr-2" />
              Export
            </Button>
          )}
          
          {children}
        </div>
      </div>
    </div>
  );
};

export default FilterBar;