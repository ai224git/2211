import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowDown, ArrowUp, Search } from 'lucide-react';
import { Database } from '../types/supabase';

type Formation = Database['public']['Tables']['formations']['Row'];

interface FormationTableProps {
  formations: Formation[];
  isLoading: boolean;
  totalCount: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onSort: (column: string) => void;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  filters: {
    search: string;
    type: string[];
    departement?: string;
    ville?: string;
    autre?: string;
  };
  onFilterChange: (filters: any) => void;
}

const FormationTable: React.FC<FormationTableProps> = ({ 
  formations, 
  isLoading, 
  totalCount, 
  currentPage, 
  onPageChange, 
  onSort,
  sortColumn,
  sortDirection,
  filters,
  onFilterChange
}) => {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState(filters.search);
  
  const formationTypes = [
    { id: 'BTS', label: 'BTS' },
    { id: 'BUT', label: 'BUT' },
    { id: 'CPGE', label: 'CPGE' },
    { id: 'Licence', label: 'Licence' },
    { id: 'PASS', label: 'PASS' },
    { id: 'Staps', label: 'Staps' },
    { id: 'Sciences Po', label: 'Sciences Po' },
    { id: 'Ifsi', label: 'Ifsi' },
    { id: 'Ec Com', label: 'Ec Com' },
    { id: 'Ingé', label: 'Ingé' },
    { id: 'DnMade', label: 'DnMade' }
  ];

  const mainFormationTypes = new Set(formationTypes.map(type => type.id));
  const otherFormationTypes = Array.from(
    new Set(formations.map(f => f.voie).filter(voie => !mainFormationTypes.has(voie)))
  ).sort();
  
  const totalPages = Math.ceil(totalCount / 500);
  
  const handleRowClick = (formation: Formation) => {
    navigate(`/formation/${formation.id}`);
  };
  
  const handleTypeFilterChange = (type: string) => {
    const updatedTypes = filters.type.includes(type)
      ? filters.type.filter(t => t !== type)
      : [...filters.type, type];
    
    onFilterChange({ ...filters, type: updatedTypes });
  };
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({ ...filters, search: searchInput });
  };
  
  const handleSortClick = (column: string) => {
    onSort(column);
  };
  
  const getSortIcon = (column: string) => {
    if (sortColumn !== column) return null;
    
    return sortDirection === 'asc' 
      ? <ArrowUp className="inline-block h-4 w-4 ml-1" /> 
      : <ArrowDown className="inline-block h-4 w-4 ml-1" />;
  };
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b">
        <div className="flex flex-col space-y-4">
          <form onSubmit={handleSearchSubmit} className="flex-1">
            <div className="relative">
              <input 
                type="text"
                placeholder="Rechercher une formation..."
                className="w-full px-4 py-2 border rounded-md pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </form>
          
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex flex-wrap gap-2">
              {formationTypes.map(type => (
                <label key={type.id} className="flex items-center gap-1.5 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={filters.type.includes(type.id)}
                    onChange={() => handleTypeFilterChange(type.id)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">{type.label}</span>
                </label>
              ))}
            </div>

            <div className="flex gap-4">
              <select
                value={filters.autre || ''}
                onChange={(e) => onFilterChange({ ...filters, autre: e.target.value })}
                className="px-3 py-1.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Autres formations</option>
                {otherFormationTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>

              <select
                value={filters.departement || ''}
                onChange={(e) => onFilterChange({ ...filters, departement: e.target.value })}
                className="px-3 py-1.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Département</option>
                {Array.from(new Set(formations.map(f => f.departement))).sort().map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>

              <select
                value={filters.ville || ''}
                onChange={(e) => onFilterChange({ ...filters, ville: e.target.value })}
                className="px-3 py-1.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Ville</option>
                {Array.from(new Set(formations.map(f => f.ville))).sort().map(ville => (
                  <option key={ville} value={ville}>{ville}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                scope="col" 
                className="w-[35%] px-0 py-8 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition"
                onClick={() => handleSortClick('etablissement')}
              >
                <div className="transform -rotate-45 origin-left h-24 flex items-end">
                  <span>Établissement {getSortIcon('etablissement')}</span>
                </div>
              </th>
              <th 
                scope="col" 
                className="w-[35%] px-0 py-8 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition"
                onClick={() => handleSortClick('filiere')}
              >
                <div className="transform -rotate-45 origin-left h-24 flex items-end">
                  <span>Filière {getSortIcon('filiere')}</span>
                </div>
              </th>
              <th 
                scope="col" 
                className="w-[5%] px-0 py-8 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition"
                onClick={() => handleSortClick('voie')}
              >
                <div className="transform -rotate-45 origin-left h-24 flex items-end">
                  <span>Voie {getSortIcon('voie')}</span>
                </div>
              </th>
              <th 
                scope="col" 
                className="w-[15%] px-0 py-8 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition"
                onClick={() => handleSortClick('ville')}
              >
                <div className="transform -rotate-45 origin-left h-24 flex items-end">
                  <span>Ville {getSortIcon('ville')}</span>
                </div>
              </th>
              <th 
                scope="col" 
                className="w-[5%] px-0 py-8 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition"
                onClick={() => handleSortClick('departement')}
              >
                <div className="transform -rotate-45 origin-left h-24 flex items-end">
                  <span>Département {getSortIcon('departement')}</span>
                </div>
              </th>
              <th 
                scope="col" 
                className="w-[5%] px-0 py-8 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition"
                onClick={() => handleSortClick('places')}
              >
                <div className="transform -rotate-45 origin-left h-24 flex items-end">
                  <span>Places {getSortIcon('places')}</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              Array.from({ length: 10 }).map((_, index) => (
                <tr key={index} className="animate-pulse">
                  <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded"></div></td>
                  <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded"></div></td>
                  <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded"></div></td>
                  <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded"></div></td>
                  <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded"></div></td>
                  <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded"></div></td>
                </tr>
              ))
            ) : formations.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  Aucune formation trouvée
                </td>
              </tr>
            ) : (
              formations.map((formation) => (
                <tr 
                  key={formation.id}
                  onClick={() => handleRowClick(formation)}
                  className="hover:bg-blue-50 cursor-pointer transition"
                >
                  <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate" title={formation.etablissement}>
                    {formation.etablissement}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate" title={formation.filiere}>
                    {formation.filiere}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900" title={formation.voie}>
                    {formation.voie}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900" title={formation.ville}>
                    {formation.ville}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900" title={formation.departement}>
                    {formation.departement}
                  </td>
                  <td className="px-4 py-3 text-sm text-blue-600 font-medium">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {formation.places}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Affichage de <span className="font-medium">{(currentPage - 1) * 500 + 1}</span> à{' '}
                <span className="font-medium">{Math.min(currentPage * 500, totalCount)}</span> sur{' '}
                <span className="font-medium">{totalCount}</span> résultats
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  Précédent
                </button>
                
                {[...Array(Math.min(5, totalPages))].map((_, index) => {
                  let pageNumber;
                  
                  if (totalPages <= 5) {
                    pageNumber = index + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = index + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + index;
                  } else {
                    pageNumber = currentPage - 2 + index;
                  }
                  
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => onPageChange(pageNumber)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === pageNumber
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === totalPages ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  Suivant
                </button>
              </nav>
            </div>
          </div>
          
          <div className="flex sm:hidden justify-between w-full">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                currentPage === 1 ? 'text-gray-300 bg-gray-50' : 'text-gray-700 bg-white hover:bg-gray-50'
              }`}
            >
              Précédent
            </button>
            <span className="text-sm text-gray-700">
              Page {currentPage} sur {totalPages}
            </span>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                currentPage === totalPages ? 'text-gray-300 bg-gray-50' : 'text-gray-700 bg-white hover:bg-gray-50'
              }`}
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormationTable;