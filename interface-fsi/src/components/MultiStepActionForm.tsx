"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface StepChoice {
  value: string;
  title: string;
  description?: string;
  icon?: "check" | "x" | "wifi" | "wifi-off" | "gauge";
}

interface FormStep {
  id: string;
  key: string;
  tag: string;
  question: string;
  hint: string;
  choices?: StepChoice[];
  inputType?: "choices" | "textarea";
  textareaPlaceholder?: string;
  optional?: boolean;
  isGrid?: boolean;
}

interface MultiStepActionFormProps {
  dlNumber: string;
  actionAlreadyFilled: boolean;
  existingAction?: string;
  downtimeStart?: string;
  onActionSaved: () => void;
  lineFound: boolean;
}

const issueLabels: Record<string, StepChoice[]> = {
  déconnexion: [
    {
      value: "déconnexions_courantes_perte_synchro",
      title: "Déconnexions courantes avec perte de synchro",
      description: "Modem et branchement vérifiés — tester la ligne",
    },
    {
      value: "déconnexion_courante_perte_synchro",
      title: "Déconnexion courante avec perte de synchro",
      description: "Cas isolé",
    },
    {
      value: "ligne_n_a_pas_de_synchro",
      title: "Ligne n'a pas de synchro",
      description: "Pas de synchronisation du tout",
    },
    {
      value: "autre",
      title: "Autre",
      description: "Préciser dans le commentaire",
    },
  ],
  pas_de_synchro: [
    {
      value: "pas_de_synchro_modem_branchement_verifie",
      title: "Pas de synchronisation — modem & branchement vérifiés",
      description: "Merci de tester la ligne et faire le nécessaire",
    },
    {
      value: "synchro_pas_acces_cote_dslam",
      title: "Synchro sans accès — vérifier côté DSLAM",
      description: "Modem bien configuré",
    },
    {
      value: "migration_vdsl_pas_synchro",
      title: "Depuis migration VDSL — pas de synchro",
      description: "Modem et branchement vérifiés",
    },
    {
      value: "ligne_n_a_pas_de_synchro",
      title: "Ligne n'a pas de synchro",
      description: "",
    },
    {
      value: "autre",
      title: "Autre",
      description: "Préciser dans le commentaire",
    },
  ],
  debit_lent: [
    {
      value: "debit_tres_lent_pc_modem_verifies",
      title: "Débit très lent — PC et modem vérifiés",
      description: "Merci de vérifier le débit et tester la qualité de ligne",
    },
    {
      value: "debit_inverse",
      title: "Débit inversé",
      description: "Le modem affiche un débit supérieur à l'abonnement",
    },
    {
      value: "ligne_non_qualifiee",
      title: "Ligne non qualifiée",
      description: "Qualité de ligne médiocre — intervention nécessaire",
    },
    {
      value: "lenteur_upload",
      title: "Lenteur au niveau Upload",
      description: "Débit upload insuffisant",
    },
    {
      value: "autre",
      title: "Autre",
      description: "Préciser dans le commentaire",
    },
  ],
};

const steps: FormStep[] = [
  {
    id: "step-1",
    key: "etat_modem",
    tag: "Étape 1 · Modem",
    question: "État du modem",
    hint: "Quelle est l'état de connexion du modem chez le client ?",
    choices: [
      { value: "Connecté", title: "Connecté", description: "Le modem est allumé et synchronisé", icon: "wifi" },
      { value: "Non connecté", title: "Non connecté", description: "Pas de connexion détectée", icon: "wifi-off" },
    ],
  },
  {
    id: "step-2",
    key: "type_probleme",
    tag: "Étape 2 · Type de problème",
    question: "Nature du problème signalé",
    hint: "Sélectionnez le type de panne pour afficher les questions correspondantes.",
    choices: [
      { value: "déconnexion", title: "Déconnexion / Perte de synchro", description: "Le modem se déconnecte de façon répétée", icon: "gauge" },
      { value: "pas_de_synchro", title: "Pas de synchronisation", description: "Tonalité, modem allumé, mais pas de synchro", icon: "wifi-off" },
      { value: "debit_lent", title: "Débit lent / Qualité de ligne", description: "Connexion instable ou vitesse insuffisante", icon: "gauge" },
    ],
  },
  {
    id: "step-3a",
    key: "perte_de_synchro",
    tag: "Étape 3 · Diagnostic",
    question: "Perte de synchro constatée ?",
    hint: "Le modem perd-il la synchronisation lors des déconnexions ?",
    isGrid: true,
    choices: [
      { value: "Oui", title: "Oui", icon: "check" },
      { value: "Non", title: "Non", icon: "x" },
    ],
  },
  {
    id: "step-4a",
    key: "deconnexion_sans_filtre",
    tag: "Étape 4 · Diagnostic",
    question: "Déconnexion sans filtre ?",
    hint: "Le problème se produit-il même sans filtre ADSL sur la ligne ?",
    isGrid: true,
    choices: [
      { value: "Oui", title: "Oui", icon: "check" },
      { value: "Non", title: "Non", icon: "x" },
    ],
  },
  {
    id: "step-3b",
    key: "tonalite",
    tag: "Étape 3 · Diagnostic",
    question: "Tonalité présente sur la ligne ?",
    hint: "Y a-t-il une tonalité téléphonique sur la ligne ?",
    isGrid: true,
    choices: [
      { value: "Oui", title: "Oui", icon: "check" },
      { value: "Non", title: "Non", icon: "x" },
    ],
  },
  {
    id: "step-4b",
    key: "ligne_suspendue",
    tag: "Étape 4 · Diagnostic",
    question: "Ligne suspendue ?",
    hint: "La ligne est-elle suspendue ou résiliée ?",
    isGrid: true,
    choices: [
      { value: "Oui", title: "Oui", icon: "check" },
      { value: "Non", title: "Non", icon: "x" },
    ],
  },
  {
    id: "step-5b",
    key: "modem_allume",
    tag: "Étape 5 · Diagnostic",
    question: "Modem allumé ?",
    hint: "Le modem est-il physiquement allumé chez le client ?",
    isGrid: true,
    choices: [
      { value: "Oui", title: "Oui", icon: "check" },
      { value: "Non", title: "Non", icon: "x" },
    ],
  },
  {
    id: "step-6b",
    key: "synchro_sans_filtre",
    tag: "Étape 6 · Diagnostic",
    question: "Synchro sans filtre ?",
    hint: "Le modem se synchronise-t-il en branchement direct sans filtre ?",
    isGrid: true,
    choices: [
      { value: "Oui", title: "Oui", icon: "check" },
      { value: "Non", title: "Non", icon: "x" },
    ],
  },
  {
    id: "step-3c",
    key: "test_ftp",
    tag: "Étape 3 · Vérification",
    question: "Test de téléchargement FTP local réussi ?",
    hint: "Un test de download sur un site FTP local a-t-il été effectué avec succès ?",
    isGrid: true,
    choices: [
      { value: "Oui", title: "Oui", icon: "check" },
      { value: "Non", title: "Non", icon: "x" },
    ],
  },
  {
    id: "step-4c",
    key: "verif_pc",
    tag: "Étape 4 · Vérification",
    question: "Vérification du PC client (RAM, Virus…) ?",
    hint: "L'état du PC client a-t-il été vérifié ?",
    isGrid: true,
    choices: [
      { value: "Oui", title: "Oui", icon: "check" },
      { value: "Non", title: "Non", icon: "x" },
    ],
  },
  {
    id: "step-5c",
    key: "verif_config_modem",
    tag: "Étape 5 · Vérification",
    question: "Vérification de la configuration modem ?",
    hint: "La configuration du modem a-t-elle été contrôlée ?",
    isGrid: true,
    choices: [
      { value: "Oui", title: "Oui", icon: "check" },
      { value: "Non", title: "Non", icon: "x" },
    ],
  },
  {
    id: "step-6c",
    key: "reboot_modem",
    tag: "Étape 6 · Vérification",
    question: "Reboot modem effectué ?",
    hint: "Le modem a-t-il été redémarré ?",
    isGrid: true,
    choices: [
      { value: "Oui", title: "Oui", icon: "check" },
      { value: "Non", title: "Non", icon: "x" },
    ],
  },
  {
    id: "step-7c",
    key: "ping_modem",
    tag: "Étape 7 · Vérification",
    question: "Ping sur le modem réussi ?",
    hint: "Un ping vers le modem a-t-il reçu une réponse ?",
    isGrid: true,
    choices: [
      { value: "Oui", title: "Oui", icon: "check" },
      { value: "Non", title: "Non", icon: "x" },
    ],
  },
  {
    id: "step-8c",
    key: "connexion_pc_modem",
    tag: "Étape 8 · Vérification",
    question: "Connexion entre PC et modem OK ?",
    hint: "Le câble ou Wi-Fi entre le PC et le modem est-il fonctionnel ?",
    isGrid: true,
    choices: [
      { value: "Oui", title: "Oui", icon: "check" },
      { value: "Non", title: "Non", icon: "x" },
    ],
  },
  {
    id: "step-9c",
    key: "adresse_ip_auto",
    tag: "Étape 9 · Vérification",
    question: "Adresse IP automatique sur le PC ?",
    hint: "Le PC est-il configuré pour obtenir une adresse IP automatiquement (DHCP) ?",
    isGrid: true,
    choices: [
      { value: "Oui", title: "Oui", icon: "check" },
      { value: "Non", title: "Non", icon: "x" },
    ],
  },
  {
    id: "step-msg",
    key: "message_fsi_base",
    tag: "Étape · Message FSI",
    question: "Statut de la connexion",
    hint: "Sélectionnez la situation de connexion du client.",
    choices: [
      { value: "Connexion établie au moins une fois.", title: "Connexion établie au moins une fois", description: "Le client s'est connecté au moins une fois par le passé" },
      { value: "Nouvelle connexion : 1ère fois.", title: "Nouvelle connexion — 1ère fois", description: "Premier essai de connexion, jamais connecté" },
    ],
  },
  {
    id: "step-issue",
    key: "probleme_detail",
    tag: "Étape · Problème détaillé",
    question: "Type de problème à signaler à l'opérateur",
    hint: "Choisissez le message standard qui décrit le problème.",
    choices: [],
  },
  {
    id: "step-comment",
    key: "commentaire",
    tag: "Étape · Commentaire",
    question: "Commentaire complémentaire",
    hint: "Ajoutez tout détail technique supplémentaire : débit mesuré, SNR, atténuation, etc.",
    inputType: "textarea",
    textareaPlaceholder: "Ex: débit mesuré 2,4 Mbps, SNR 6 dB, atténuation 38 dB…",
    optional: true,
  },
];

function ChoiceIcon({ kind }: { kind?: StepChoice["icon"] }) {
  const strokeProps = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.9,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (kind) {
    case "wifi":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
          <path {...strokeProps} d="M5 9a11 11 0 0 1 14 0" />
          <path {...strokeProps} d="M8 12a7 7 0 0 1 8 0" />
          <path {...strokeProps} d="M11 15a3 3 0 0 1 2 0" />
          <circle cx="12" cy="18" r="1.2" fill="currentColor" />
        </svg>
      );
    case "wifi-off":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
          <path {...strokeProps} d="M5 9a11 11 0 0 1 8-3" />
          <path {...strokeProps} d="M8 12a7 7 0 0 1 4-2" />
          <path {...strokeProps} d="M11 15a3 3 0 0 1 1 0" />
          <path {...strokeProps} d="M3 3l18 18" />
        </svg>
      );
    case "gauge":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
          <path {...strokeProps} d="M4 14a8 8 0 1 1 16 0" />
          <path {...strokeProps} d="M12 12l4-4" />
          <circle cx="12" cy="14" r="1.2" fill="currentColor" />
        </svg>
      );
    case "x":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
          <path {...strokeProps} d="M6 6l12 12" />
          <path {...strokeProps} d="M18 6L6 18" />
        </svg>
      );
    case "check":
    default:
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
          <path {...strokeProps} d="M20 7L10 17l-5-5" />
        </svg>
      );
  }
}

export default function MultiStepActionForm({ 
  dlNumber, 
  actionAlreadyFilled, 
  existingAction,
  downtimeStart,
  onActionSaved,
  lineFound 
}: MultiStepActionFormProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [stepPath, setStepPath] = useState<string[]>(["step-1", "step-2"]);
  const [isSaving, setIsSaving] = useState(false);
  const [forceNewAction, setForceNewAction] = useState(false);

  const currentStep = steps.find((step) => step.id === stepPath[currentStepIndex]);
  const issueChoices = currentStep?.id === "step-issue" ? issueLabels[answers.type_probleme] ?? [] : [];

  useEffect(() => {
    let basePath = ["step-1", "step-2"];

    if (answers.type_probleme === "déconnexion") {
      basePath = [...basePath, "step-3a", "step-4a"];
    } else if (answers.type_probleme === "pas_de_synchro") {
      basePath = [...basePath, "step-3b", "step-4b", "step-5b", "step-6b"];
    } else if (answers.type_probleme === "debit_lent") {
      basePath = [...basePath, "step-3c", "step-4c", "step-5c", "step-6c", "step-7c", "step-8c", "step-9c"];
    } else {
      setStepPath(basePath);
      return;
    }

    basePath = [...basePath, "step-msg", "step-issue", "step-comment"];

    setStepPath(basePath);
  }, [answers.type_probleme]);

  useEffect(() => {
    if (currentStepIndex >= stepPath.length) {
      setCurrentStepIndex(Math.max(stepPath.length - 1, 0));
    }
  }, [currentStepIndex, stepPath.length]);

  const handleChoice = (key: string, value: string) => {
    setAnswers({ ...answers, [key]: value });
  };

  const formatActionOutput = () => {
    const parts: string[] = [];
    
    if (answers.etat_modem) parts.push(`état modem : ${answers.etat_modem}`);
    if (answers.type_probleme) parts.push(`Type problème : ${answers.type_probleme}`);
    
    // Déconnexion path
    if (answers.perte_de_synchro) parts.push(`Perte de synchro : ${answers.perte_de_synchro}`);
    if (answers.deconnexion_sans_filtre) parts.push(`Déconnexion sans filtre : ${answers.deconnexion_sans_filtre}`);
    
    // Pas de synchro path
    if (answers.tonalite) parts.push(`Tonalité : ${answers.tonalite}`);
    if (answers.ligne_suspendue) parts.push(`Ligne Suspendue : ${answers.ligne_suspendue}`);
    if (answers.modem_allume) parts.push(`Modem allumé : ${answers.modem_allume}`);
    if (answers.synchro_sans_filtre) parts.push(`Synchro sans filtre : ${answers.synchro_sans_filtre}`);
    
    // Débit lent path
    if (answers.test_ftp) parts.push(`Test de téléchargement sur un site FTP local : ${answers.test_ftp}`);
    if (answers.verif_pc) parts.push(`Vérification du PC client : ${answers.verif_pc}`);
    if (answers.verif_config_modem) parts.push(`Vérification de la configuration modem : ${answers.verif_config_modem}`);
    if (answers.reboot_modem) parts.push(`Reboot modem : ${answers.reboot_modem}`);
    if (answers.ping_modem) parts.push(`Ping sur le modem : ${answers.ping_modem}`);
    if (answers.connexion_pc_modem) parts.push(`Connexion entre PC et modem : ${answers.connexion_pc_modem}`);
    if (answers.adresse_ip_auto) parts.push(`Adresse IP automatique sur le PC : ${answers.adresse_ip_auto}`);
    
    // Final steps
    if (answers.message_fsi_base) parts.push(`Message FSI : ${answers.message_fsi_base}`);
    if (answers.probleme_detail) parts.push(`Problème détaillé : ${answers.probleme_detail}`);
    if (answers.commentaire) parts.push(`Commentaire : ${answers.commentaire}`);
    
    return parts.join(" ");
  };

  const handleNext = async () => {
    if (!currentStep) return;

    if (currentStep.id === "step-comment") {
      // Save to database
      setIsSaving(true);
      try {
        const actionOutput = formatActionOutput();
        const response = await fetch('/api/ligne', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dlNumber: dlNumber,
            actionFSI: actionOutput,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to save');
        }

        toast.success("Action enregistrée avec succès");
        onActionSaved();
      } catch (error) {
        console.error('Save error:', error);
        toast.error("Erreur lors de l'enregistrement");
      } finally {
        setIsSaving(false);
      }
      return;
    }

    if (currentStepIndex < stepPath.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const progress = ((currentStepIndex + 1) / stepPath.length) * 100;
  const isAnswered =
    currentStep?.optional || currentStep?.inputType === "textarea"
      ? true
      : currentStep
        ? answers[currentStep.key] !== undefined
        : false;

  if (!currentStep) return null;

  // Show message when no line is found yet
  if (!lineFound) {
    return (
      <div className="w-full max-w-[560px] mx-auto font-[family-name:var(--font-manrope)]">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 mb-4 rounded-full bg-[#f3f4f6] flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-[#9ca3af]" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </div>
          <h3 className="text-[16px] font-semibold text-[#374151] mb-2 font-[family-name:var(--font-montserrat)]">
            Recherchez une ligne
          </h3>
          <p className="text-[13px] text-[#9ca3af] max-w-[280px]">
            Entrez un numéro DLigne (ex: DL-007716) pour commencer le diagnostic.
          </p>
        </div>
      </div>
    );
  }

  // Show message when action is already filled
  if (actionAlreadyFilled && !forceNewAction) {
    const formatDate = (dateStr?: string) => {
      if (!dateStr) return '';
      try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('fr-FR', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch {
        return dateStr;
      }
    };

    return (
      <div className="w-full max-w-[560px] mx-auto font-[family-name:var(--font-manrope)]">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-16 h-16 mb-4 rounded-full bg-[#fef3c7] flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-[#d97706]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            </svg>
          </div>
          <h3 className="text-[16px] font-semibold text-[#d97706] mb-2 font-[family-name:var(--font-montserrat)]">
            Réclamation déjà faite
          </h3>
          <p className="text-[14px] text-[#374151] mb-4 font-[family-name:var(--font-montserrat)]">
            le {formatDate(downtimeStart)}
          </p>
          <p className="text-[13px] text-[#6b7280] max-w-[320px] mb-6">
            Voulez-vous ajouter une nouvelle action ?
          </p>
          <button
            onClick={() => setForceNewAction(true)}
            className="h-[42px] rounded-lg bg-[#1e3a6e] text-white px-6 text-[14px] font-semibold flex items-center justify-center gap-2 hover:bg-[#2a4a8e] transition-all font-[family-name:var(--font-montserrat)]"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
            Ajouter une nouvelle action
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[560px] mx-auto font-[family-name:var(--font-manrope)]">
      <div className="flex items-center gap-2 mb-8">
        <div className="flex-1 h-[2px] bg-[#e5e7eb] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#1e3a6e] rounded-full transition-all duration-400"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-[11px] text-[#9ca3af] min-w-[44px] text-right">
          {currentStepIndex + 1} / {stepPath.length}
        </div>
      </div>

      <div className="animate-slideIn">
        <div className="text-[10px] tracking-[0.14em] text-[#1e3a6e] uppercase mb-2.5 font-[family-name:var(--font-montserrat)] font-semibold">
          {currentStep.tag}
        </div>
        <div className="text-[17px] font-semibold text-[#1f2937] leading-[1.45] mb-1.5 font-[family-name:var(--font-montserrat)]">
          {currentStep.question}
        </div>
        <div className="text-[13px] text-[#9ca3af] mb-5 leading-[1.5]">
          {currentStep.hint}
        </div>

        {currentStep.inputType === "textarea" ? (
          <textarea
            value={answers[currentStep.key] ?? ""}
            onChange={(e) => handleChoice(currentStep.key, e.target.value)}
            placeholder={currentStep.textareaPlaceholder}
            className="w-full min-h-[120px] px-4 py-3 bg-[#f9fafb] border border-[#e5e7eb] rounded-[10px] text-[14px] text-[#1f2937] placeholder-[#9ca3af] resize-none outline-none focus:border-[#1e3a6e] focus:ring-2 focus:ring-[#1e3a6e]/20"
          />
        ) : (
          <div className={currentStep.isGrid ? "grid grid-cols-1 gap-2 sm:grid-cols-2" : "flex flex-col gap-2"}>
            {(currentStep.id === "step-issue" ? issueChoices : currentStep.choices ?? []).map((choice) => (
              <button
                key={choice.value}
                type="button"
                onClick={() => handleChoice(currentStep.key, choice.value)}
                className={`flex items-center gap-3 px-4 py-3.5 bg-[#f9fafb] border rounded-[10px] cursor-pointer transition-all text-left ${
                  answers[currentStep.key] === choice.value
                    ? "border-[#1e3a6e] bg-[#1e3a6e]/5"
                    : "border-[#e5e7eb] hover:border-[#d1d5db] hover:bg-white"
                } ${currentStep.isGrid ? "flex-col items-start gap-1.5" : ""}`}
              >
                {choice.icon && (
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border ${
                      answers[currentStep.key] === choice.value
                        ? "bg-[#1e3a6e]/10 border-[#1e3a6e] text-[#1e3a6e]"
                        : "bg-white border-[#e5e7eb] text-[#6b7280]"
                    }`}
                  >
                    <ChoiceIcon kind={choice.icon} />
                  </div>
                )}
                <div className="flex-1">
                  <div className="text-[14px] font-semibold text-[#1f2937] leading-[1.3] font-[family-name:var(--font-montserrat)]">
                    {choice.title}
                  </div>
                  {choice.description && (
                    <div className="text-[12px] text-[#9ca3af] mt-0.5 leading-[1.4]">
                      {choice.description}
                    </div>
                  )}
                </div>
                <div
                  className={`w-[18px] h-[18px] rounded-full border-[1.5px] flex items-center justify-center flex-shrink-0 transition-all ${
                    answers[currentStep.key] === choice.value
                      ? "border-[#1e3a6e] bg-[#1e3a6e]"
                      : "border-[#d1d5db]"
                  } ${currentStep.isGrid ? "mt-auto" : ""}`}
                >
                  {answers[currentStep.key] === choice.value && <div className="w-[6px] h-[6px] rounded-full bg-white" />}
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="mt-7 flex flex-col gap-2.5 sm:flex-row">
          {currentStepIndex > 0 && (
            <button
              type="button"
              onClick={handleBack}
              disabled={isSaving}
              className="h-[42px] w-full rounded-lg border border-[#e5e7eb] bg-[#f9fafb] text-[#9ca3af] px-5 text-[14px] font-semibold hover:border-[#d1d5db] hover:text-[#1f2937] transition-all sm:w-auto sm:flex-shrink-0 font-[family-name:var(--font-montserrat)] disabled:opacity-50"
            >
              Retour
            </button>
          )}
          <button
            type="button"
            onClick={handleNext}
            disabled={!isAnswered || isSaving}
            className="h-[42px] w-full rounded-lg bg-[#1e3a6e] text-white px-5 text-[14px] font-semibold flex items-center justify-center gap-1.5 hover:bg-[#2a4a8e] transition-all sm:flex-1 disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-[#1e3a6e] font-[family-name:var(--font-montserrat)]"
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : currentStep.id === "step-comment" ? (
              "Enregistrer"
            ) : (
              "Continuer"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
