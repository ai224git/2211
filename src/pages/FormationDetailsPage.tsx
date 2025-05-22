import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Loader2 } from 'lucide-react';
import { getFormationById, useToken } from '../lib/supabase';
import { useAuthStore } from '../store/auth';

const FormationDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, tokens, decrementToken, refreshTokens } = useAuthStore();
  
  const [formation, setFormation] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessingToken, setIsProcessingToken] = useState(false);
  const [hasViewedWithToken, setHasViewedWithToken] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [notes, setNotes] = useState<string | null>(null);
  
  const fetchFormation = async () => {
    if (!id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const formationData = await getFormationById(parseInt(id));
      setFormation(formationData);
      
      // Only set notes if user has already viewed this formation
      if (formationData.notes && !formationData.locked) {
        setNotes(formationData.notes);
        setHasViewedWithToken(true);
      }
    } catch (err) {
      setError('Impossible de charger les détails de la formation');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchFormation();
  }, [id, user]); // Re-fetch when user changes
  
  const handleUseToken = () => {
    setShowConfirmation(true);
  };

  const confirmUseToken = async () => {
    if (!user || !id) return;
    
    setIsProcessingToken(true);
    setError(null);
    setShowConfirmation(false);
    
    try {
      await useToken(parseInt(id));
      decrementToken();
      setHasViewedWithToken(true);
      await refreshTokens(); // Refresh tokens from server
      await fetchFormation(); // Refetch formation data to get notes
    } catch (err: any) {
      console.error('Error using token:', err);
      setError(err.message || 'Une erreur est survenue lors de l\'utilisation du token');
    } finally {
      setIsProcessingToken(false);
    }
  };

  const cancelUseToken = () => {
    setShowConfirmation(false);
  };
  
  const goToTokenPurchase = () => {
    navigate('/tokens');
  };

  const handleLogin = () => {
    // Save current location to redirect back after login
    navigate('/login', { state: { from: location.pathname } });
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
        <p className="text-lg text-gray-600">Chargement des détails de la formation...</p>
      </div>
    );
  }
  
  if (error || !formation) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-xl w-full text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-700 mb-2">Erreur</h2>
          <p className="text-red-600 mb-6">{error || 'Formation introuvable'}</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <main className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate('/')}
        className="flex items-center text-blue-600 hover:text-blue-800 mb-6 transition"
      >
        <ArrowLeft className="h-4 w-4 mr-1" /> Retour aux formations
      </button>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-blue-700 px-6 py-4">
          <h1 className="text-2xl font-bold text-white">Détails de la Formation</h1>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Informations générales</h2>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500">Établissement:</p>
                  <p className="text-base text-gray-900">{formation.etablissement}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Filière:</p>
                  <p className="text-base text-gray-900">{formation.filiere}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Voie:</p>
                  <p className="text-base text-gray-900">{formation.voie}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Localisation et places</h2>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500">Ville:</p>
                  <p className="text-base text-gray-900">{formation.ville}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Département:</p>
                  <p className="text-base text-gray-900">{formation.departement}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Places disponibles:</p>
                  <p className="text-lg font-semibold text-blue-600">{formation.places}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Évaluation moyenne</h2>
            
            {!user ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                <h3 className="text-lg font-medium text-yellow-800 mb-2">Connectez-vous pour voir l'évaluation</h3>
                <p className="text-yellow-700 mb-4">Vous devez être connecté pour accéder à cette information.</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={handleLogin}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                  >
                    Se connecter
                  </button>
                  <button
                    onClick={() => navigate('/signup', { state: { from: location.pathname } })}
                    className="px-4 py-2 bg-white border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition"
                  >
                    S'inscrire
                  </button>
                </div>
              </div>
            ) : tokens <= 0 && !hasViewedWithToken ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                <h3 className="text-lg font-medium text-yellow-800 mb-2">Achetez des tokens pour voir l'évaluation</h3>
                <p className="text-yellow-700 mb-4">
                  Vous n'avez pas de tokens disponibles. Achetez des tokens pour accéder à cette information.
                </p>
                <button
                  onClick={goToTokenPurchase}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                  Acheter des tokens
                </button>
              </div>
            ) : !hasViewedWithToken ? (
              showConfirmation ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                  <h3 className="text-lg font-medium text-blue-800 mb-2">Confirmer l'utilisation du token</h3>
                  <p className="text-blue-700 mb-4">
                    Êtes-vous sûr de vouloir utiliser un token pour voir l'évaluation de cette formation ?
                    Cette action est irréversible.
                  </p>
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={confirmUseToken}
                      disabled={isProcessingToken}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:bg-blue-400"
                    >
                      {isProcessingToken ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 inline animate-spin" />
                          Traitement...
                        </>
                      ) : (
                        'Confirmer'
                      )}
                    </button>
                    <button
                      onClick={cancelUseToken}
                      disabled={isProcessingToken}
                      className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                  <h3 className="text-lg font-medium text-blue-800 mb-2">Utilisez un token pour voir l'évaluation</h3>
                  <p className="text-blue-700 mb-4">
                    Vous avez {tokens} token{tokens > 1 ? 's' : ''} disponible{tokens > 1 ? 's' : ''}. Utilisez un token pour voir l'évaluation moyenne attendue.
                  </p>
                  <button
                    onClick={handleUseToken}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                  >
                    Utiliser un token
                  </button>
                </div>
              )
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <p className="text-xl text-center font-medium text-green-800 mb-2">
                  La formation "{formation.etablissement}" est évaluée par la notation suivante:
                </p>
                <p className="text-3xl text-center font-bold text-green-700">
                  {formation.notes}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default FormationDetailsPage;