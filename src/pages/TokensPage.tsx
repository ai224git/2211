import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '../store/auth';

const TokensPage: React.FC = () => {
  const { user, tokens } = useAuthStore();
  const navigate = useNavigate();
  
  const stripePaymentLink = 'https://buy.stripe.com/test_8wM1711VCf6b5MI3cc';
  
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-lg w-full text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-yellow-700 mb-2">Connexion requise</h2>
          <p className="text-yellow-600 mb-6">Vous devez être connecté pour acheter des tokens.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Se connecter
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="px-4 py-2 bg-white border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition"
            >
              S'inscrire
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Acheter des tokens</h1>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <CheckCircle className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-blue-800">Votre solde actuel</h3>
              <p className="mt-2 text-3xl font-bold text-blue-700">
                {tokens} token{tokens !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Achetez des tokens pour accéder aux évaluations</h2>
            <p className="text-gray-600 mb-6">
              Chaque token vous permet de consulter l'évaluation moyenne d'une formation.
              Utilisez ces informations pour mieux préparer votre dossier Parcoursup.
            </p>
            
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b">
                <h3 className="font-medium text-gray-700">Offre disponible</h3>
              </div>
              
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-lg font-bold text-gray-900">1 Token</p>
                    <p className="text-gray-600 text-sm">Consultation d'une évaluation</p>
                  </div>
                  <p className="text-xl font-bold text-blue-600">9,00 €</p>
                </div>
                
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Accès à l'évaluation moyenne d'une formation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Estimation précise de vos chances d'admission</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Paiement sécurisé par Stripe</span>
                  </li>
                </ul>
                
                <a
                  href={stripePaymentLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition"
                >
                  <CreditCard className="h-5 w-5 mr-2" />
                  Acheter maintenant
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Questions fréquentes</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Comment fonctionnent les tokens ?</h3>
                <p className="text-gray-600">
                  Chaque token vous permet de consulter l'évaluation moyenne d'une formation spécifique.
                  Une fois que vous avez utilisé un token pour consulter une formation, vous pouvez y accéder à nouveau sans consommer de token supplémentaire.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Comment sont calculées les évaluations ?</h3>
                <p className="text-gray-600">
                  Les évaluations sont basées sur les moyennes des notes des candidats acceptés dans chaque formation.
                  Ces données sont régulièrement mises à jour pour refléter les tendances d'admission actuelles.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Puis-je obtenir un remboursement ?</h3>
                <p className="text-gray-600">
                  Les tokens achetés ne sont pas remboursables. Ils restent disponibles sur votre compte et n'expirent pas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default TokensPage;