/* =========================================
   quiz.js — Quiz Mode page logic
   ========================================= */

// ── Class 12 Question Bank ─────────────────
const QUESTION_BANK = {

  // ═══════════════════════════════════════════
  //  MATHEMATICS — Class 12 CBSE
  // ═══════════════════════════════════════════
  Mathematics: [
    // Relations & Functions
    { q:"A function f:R→R defined by f(x)=2x is:", opts:["One-one and onto","Many-one","One-one but not onto","Onto but not one-one"], ans:0, exp:"f(x)=2x is a bijection (both one-one and onto) on R.", diff:"easy", topic:"Relations & Functions" },
    { q:"If f(x)=x² and g(x)=√x, then fog(x) is:", opts:["x","x²","√x","1/x"], ans:0, exp:"fog(x)=f(g(x))=f(√x)=(√x)²=x.", diff:"medium", topic:"Relations & Functions" },
    { q:"The number of all one-one functions from {1,2,3} to {1,2,3} is:", opts:["6","3","9","27"], ans:0, exp:"One-one functions = permutations = 3! = 6.", diff:"easy", topic:"Relations & Functions" },

    // Inverse Trigonometry
    { q:"sin⁻¹(sin(3π/4)) = ?", opts:["π/4","3π/4","π/2","−π/4"], ans:0, exp:"3π/4 is not in [−π/2,π/2], so sin⁻¹(sin(3π/4))=π−3π/4=π/4.", diff:"hard", topic:"Inverse Trigonometry" },
    { q:"tan⁻¹(1) = ?", opts:["π/4","π/2","π","π/3"], ans:0, exp:"tan(π/4)=1, and π/4 is in the principal range.", diff:"easy", topic:"Inverse Trigonometry" },

    // Matrices & Determinants
    { q:"If A is a 2×2 matrix and |A|=5, then |2A| = ?", opts:["20","10","5","40"], ans:0, exp:"|kA|=k^n|A| for n×n matrix. |2A|=2²×5=20.", diff:"medium", topic:"Matrices & Determinants" },
    { q:"A square matrix A is called singular if:", opts:["|A|=0","A=0","A=I","A=A^T"], ans:0, exp:"A matrix is singular when its determinant is zero.", diff:"easy", topic:"Matrices & Determinants" },
    { q:"The transpose of a column matrix is a:", opts:["Row matrix","Square matrix","Null matrix","Diagonal matrix"], ans:0, exp:"Transposing a column matrix (m×1) gives a row matrix (1×m).", diff:"easy", topic:"Matrices & Determinants" },

    // Continuity & Differentiability
    { q:"The derivative of sin(x²) is:", opts:["2x·cos(x²)","cos(x²)","2cos(x²)","−2x·sin(x²)"], ans:0, exp:"Using chain rule: d/dx[sin(x²)] = cos(x²)·2x.", diff:"medium", topic:"Continuity & Differentiability" },
    { q:"If y=eˣ·sinx, then dy/dx = ?", opts:["eˣ(sinx+cosx)","eˣsinx","eˣcosx","eˣ(sinx−cosx)"], ans:0, exp:"Product rule: eˣ·cosx + eˣ·sinx = eˣ(sinx+cosx).", diff:"medium", topic:"Continuity & Differentiability" },
    { q:"The function f(x)=|x| is:", opts:["Continuous but not differentiable at x=0","Differentiable everywhere","Not continuous","None of these"], ans:0, exp:"|x| is continuous everywhere but has a corner at x=0 so not differentiable there.", diff:"medium", topic:"Continuity & Differentiability" },

    // Applications of Derivatives
    { q:"The slope of tangent to y=x³ at x=2 is:", opts:["12","6","8","4"], ans:0, exp:"y'=3x². At x=2: slope=3×4=12.", diff:"medium", topic:"Applications of Derivatives" },
    { q:"f(x)=x³−3x is decreasing in the interval:", opts:["(−1,1)","(1,∞)","(−∞,−1)","(0,1)"], ans:0, exp:"f'=3x²−3=3(x−1)(x+1)<0 for x∈(−1,1).", diff:"hard", topic:"Applications of Derivatives" },

    // Integrals
    { q:"∫eˣ(1+x)dx = ?", opts:["xeˣ+C","eˣ+C","eˣ(x+1)+C","xeˣ−eˣ+C"], ans:0, exp:"∫eˣ(1+x)dx. Note d/dx(xeˣ)=eˣ+xeˣ=eˣ(1+x). So ∫=xeˣ+C.", diff:"hard", topic:"Integrals" },
    { q:"∫sin²x dx = ?", opts:["x/2 − sin(2x)/4 + C","sinx cosx + C","x − sinx + C","−cos²x + C"], ans:0, exp:"sin²x=(1−cos2x)/2. Integrating: x/2 − sin(2x)/4 + C.", diff:"hard", topic:"Integrals" },
    { q:"∫₀^π sinx dx = ?", opts:["2","0","1","π"], ans:0, exp:"[−cosx]₀^π = −cosπ + cos0 = 1+1 = 2.", diff:"medium", topic:"Integrals" },

    // Differential Equations
    { q:"The order of d²y/dx² + dy/dx + y = 0 is:", opts:["2","1","0","3"], ans:0, exp:"Order = highest derivative = 2 (d²y/dx²).", diff:"easy", topic:"Differential Equations" },
    { q:"The degree of (dy/dx)³ + y = 0 is:", opts:["3","1","2","None"], ans:0, exp:"Degree = power of highest order derivative = 3.", diff:"easy", topic:"Differential Equations" },

    // Vectors
    { q:"If |a⃗|=3 and |b⃗|=4, maximum value of |a⃗·b⃗| is:", opts:["12","7","1","0"], ans:0, exp:"a⃗·b⃗=|a||b|cosθ. Max when cosθ=1: 3×4=12.", diff:"medium", topic:"Vectors" },
    { q:"Unit vector in direction of (2,2,1) is:", opts:["(2/3, 2/3, 1/3)","(2,2,1)","(1/2,1/2,1/4)","(2/√9,2/√9,1/√9)"], ans:0, exp:"|v|=√(4+4+1)=3. Unit vector=(2/3,2/3,1/3).", diff:"medium", topic:"Vectors" },

    // 3D Geometry
    { q:"Direction cosines of z-axis are:", opts:["(0,0,1)","(1,0,0)","(0,1,0)","(1,1,1)"], ans:0, exp:"Z-axis: l=cos90°=0, m=cos90°=0, n=cos0°=1.", diff:"easy", topic:"3D Geometry" },

    // Probability
    { q:"P(A∪B) = P(A)+P(B)−P(A∩B) is:", opts:["Addition theorem","Multiplication theorem","Bayes' theorem","Law of total probability"], ans:0, exp:"This is the Addition theorem (or Addition rule) of probability.", diff:"easy", topic:"Probability" },
    { q:"Two dice are thrown. Probability both show 6 is:", opts:["1/36","1/6","1/12","1/3"], ans:0, exp:"P(6,6)=1/6 × 1/6 = 1/36.", diff:"easy", topic:"Probability" },
  ],

  // ═══════════════════════════════════════════
  //  PHYSICS — Class 12 CBSE
  // ═══════════════════════════════════════════
  Physics: [
    // Electrostatics
    { q:"Coulomb's law: Force between two charges is:", opts:["∝ q₁q₂ and ∝ 1/r²","∝ q₁q₂ and ∝ r²","∝ 1/q₁q₂ and ∝ 1/r²","∝ q₁+q₂ and ∝ 1/r"], ans:0, exp:"F = kq₁q₂/r². Force is proportional to product of charges and inversely to square of distance.", diff:"easy", topic:"Electrostatics" },
    { q:"Electric potential is measured in:", opts:["Volt","Newton","Joule","Coulomb"], ans:0, exp:"Electric potential (V) = Work/charge and is measured in Volts (V = J/C).", diff:"easy", topic:"Electrostatics" },
    { q:"Inside a hollow charged conductor, electric field is:", opts:["Zero","Maximum","Uniform","Same as surface"], ans:0, exp:"By Gauss's law, no charge exists inside a conductor, so E=0 inside.", diff:"medium", topic:"Electrostatics" },
    { q:"Capacitance of a parallel plate capacitor C = ?", opts:["ε₀A/d","ε₀d/A","ε₀A×d","ε₀/Ad"], ans:0, exp:"C = ε₀A/d where A is plate area and d is separation.", diff:"medium", topic:"Electrostatics" },

    // Current Electricity
    { q:"Ohm's Law states:", opts:["V ∝ I at constant T","I ∝ V² at constant T","V ∝ 1/I","V ∝ R×I²"], ans:0, exp:"Ohm's Law: V=IR, meaning V is proportional to I when temperature is constant.", diff:"easy", topic:"Current Electricity" },
    { q:"Resistors in series: Total resistance = ?", opts:["R₁+R₂+...","1/R₁+1/R₂+...","R₁×R₂/(R₁+R₂)","R₁−R₂"], ans:0, exp:"Series combination: Rtotal = R₁ + R₂ + ... + Rn.", diff:"easy", topic:"Current Electricity" },
    { q:"Kirchhoff's Current Law (KCL) states:", opts:["Sum of currents at a junction = 0","Sum of voltages in a loop = 0","Current = Voltage × Resistance","Power = Current × Voltage"], ans:0, exp:"KCL: ΣI = 0 at any junction (conservation of charge).", diff:"medium", topic:"Current Electricity" },

    // Magnetic Effects of Current
    { q:"Force on a current-carrying conductor in a magnetic field:", opts:["F = BIL sinθ","F = BIL","F = BIL cosθ","F = BI/L"], ans:0, exp:"F = BIL sinθ where θ is angle between B and current direction.", diff:"medium", topic:"Magnetic Effects" },
    { q:"The SI unit of magnetic field (B) is:", opts:["Tesla","Gauss","Weber","Henry"], ans:0, exp:"Magnetic field strength is measured in Tesla (T) in SI units.", diff:"easy", topic:"Magnetic Effects" },
    { q:"A solenoid acts like a:", opts:["Bar magnet","Electric motor","Generator","Capacitor"], ans:0, exp:"A solenoid with current behaves like a bar magnet with poles at each end.", diff:"easy", topic:"Magnetic Effects" },

    // Electromagnetic Induction
    { q:"Faraday's law of induction states EMF = ?", opts:["−dΦ/dt","dΦ/dt","Φ×t","B×A"], ans:0, exp:"EMF = −dΦ/dt (negative sign by Lenz's law showing opposing nature).", diff:"medium", topic:"Electromagnetic Induction" },
    { q:"Lenz's law is based on conservation of:", opts:["Energy","Charge","Momentum","Mass"], ans:0, exp:"Lenz's law reflects conservation of energy — induced current opposes the change causing it.", diff:"medium", topic:"Electromagnetic Induction" },

    // Optics
    { q:"Mirror formula: 1/f = ?", opts:["1/v + 1/u","1/v − 1/u","v/u","u+v"], ans:0, exp:"Mirror formula: 1/f = 1/v + 1/u where f=focal length, v=image distance, u=object distance.", diff:"easy", topic:"Optics" },
    { q:"Total internal reflection occurs when angle of incidence is:", opts:["Greater than critical angle","Less than critical angle","Equal to 0°","Equal to 90°"], ans:0, exp:"TIR occurs when i > critical angle and light is going from denser to rarer medium.", diff:"medium", topic:"Optics" },
    { q:"Young's double slit experiment demonstrates:", opts:["Wave nature of light","Particle nature of light","Polarisation","Reflection"], ans:0, exp:"YDSE produces interference pattern proving the wave nature of light.", diff:"easy", topic:"Optics" },

    // Dual Nature & Atoms
    { q:"Photoelectric effect was explained by:", opts:["Einstein","Newton","Maxwell","Bohr"], ans:0, exp:"Einstein explained photoelectric effect using photon concept (Nobel Prize 1921).", diff:"easy", topic:"Dual Nature" },
    { q:"de Broglie wavelength λ = ?", opts:["h/mv","h×mv","mv/h","m/hv"], ans:0, exp:"de Broglie wavelength: λ = h/p = h/(mv).", diff:"medium", topic:"Dual Nature" },
    { q:"In Bohr model, angular momentum = ?", opts:["nh/2π","h/2π","nh","n²h"], ans:0, exp:"Bohr's quantization: L = nh/2π = nℏ.", diff:"medium", topic:"Atoms & Nuclei" },

    // Semiconductors
    { q:"In a p-type semiconductor, majority carriers are:", opts:["Holes","Electrons","Protons","Neutrons"], ans:0, exp:"p-type semiconductor has holes as majority carriers (from trivalent impurities).", diff:"easy", topic:"Semiconductors" },
    { q:"A diode allows current to flow in:", opts:["Forward bias only","Reverse bias only","Both directions","Neither direction"], ans:0, exp:"In forward bias the depletion region narrows, allowing current. In reverse bias it blocks.", diff:"easy", topic:"Semiconductors" },
    { q:"Logic gate with output 1 only when all inputs are 1:", opts:["AND","OR","NOT","NAND"], ans:0, exp:"AND gate: output is HIGH (1) only when all inputs are HIGH (1).", diff:"easy", topic:"Semiconductors" },
  ],

  // ═══════════════════════════════════════════
  //  CHEMISTRY — Class 12 CBSE
  // ═══════════════════════════════════════════
  Chemistry: [
    // Solutions
    { q:"Raoult's Law states that the vapour pressure of a solution is:", opts:["Proportional to mole fraction of solvent","Independent of solute","Equal to vapour pressure of solvent","Inversely proportional to temperature"], ans:0, exp:"Raoult's Law: P = P₀ × χsolvent (vapour pressure ∝ mole fraction of solvent).", diff:"medium", topic:"Solutions" },
    { q:"Colligative properties depend on:", opts:["Number of solute particles","Nature of solute","Size of solute","Charge of solute"], ans:0, exp:"Colligative properties depend on the number (not nature) of solute particles.", diff:"easy", topic:"Solutions" },
    { q:"Osmosis is the flow of solvent from:", opts:["Dilute to concentrated solution","Concentrated to dilute solution","Solute to solvent","Solvent to solute only"], ans:0, exp:"Osmosis: solvent moves from lower concentration (dilute) to higher concentration (concentrated) through semipermeable membrane.", diff:"easy", topic:"Solutions" },

    // Electrochemistry
    { q:"In electrolysis, oxidation occurs at:", opts:["Anode","Cathode","Both electrodes","Neither"], ans:0, exp:"Oxidation (loss of electrons) always occurs at the anode.", diff:"easy", topic:"Electrochemistry" },
    { q:"Standard hydrogen electrode (SHE) has reduction potential:", opts:["0 V","1 V","+0.5 V","−1 V"], ans:0, exp:"By convention, SHE is assigned E° = 0.00 V (reference electrode).", diff:"easy", topic:"Electrochemistry" },
    { q:"Kohlrausch's law states:", opts:["Limiting molar conductivity is sum of ionic conductances","Conductance increases with temperature","Resistance is proportional to length","Mobility is constant"], ans:0, exp:"Kohlrausch's law: λ°m = ν+λ+ + ν−λ− (sum of limiting ionic conductances).", diff:"hard", topic:"Electrochemistry" },

    // Chemical Kinetics
    { q:"Rate of reaction is measured as:", opts:["Change in concentration per unit time","Change in mass per unit time","Change in pressure only","Change in volume"], ans:0, exp:"Rate = −d[Reactant]/dt = +d[Product]/dt (concentration change per unit time).", diff:"easy", topic:"Chemical Kinetics" },
    { q:"Half-life of a first-order reaction depends on:", opts:["Only rate constant","Initial concentration","Temperature only","Pressure only"], ans:0, exp:"For first order: t₁/₂ = 0.693/k — independent of initial concentration.", diff:"medium", topic:"Chemical Kinetics" },
    { q:"Activation energy (Ea) relates to rate constant by:", opts:["Arrhenius equation","Rate law","Raoult's Law","Henry's Law"], ans:0, exp:"Arrhenius equation: k = Ae^(−Ea/RT) relates rate constant to activation energy.", diff:"medium", topic:"Chemical Kinetics" },

    // Surface Chemistry
    { q:"Adsorption of gases on solids is generally:", opts:["Exothermic","Endothermic","Neither","Isothermal"], ans:0, exp:"Adsorption is exothermic — bonds form between adsorbate and adsorbent releasing energy.", diff:"medium", topic:"Surface Chemistry" },
    { q:"Colloids have particle size between:", opts:["1–100 nm","<1 nm",">1000 nm","0.1–1 nm"], ans:0, exp:"Colloidal particles range from 1 nm to 100 nm (intermediate between true solution and suspension).", diff:"medium", topic:"Surface Chemistry" },

    // Coordination Compounds
    { q:"Coordination number in [Co(NH₃)₆]³⁺ is:", opts:["6","3","9","12"], ans:0, exp:"Six NH₃ ligands surround Co — coordination number is 6.", diff:"easy", topic:"Coordination Compounds" },
    { q:"IUPAC name of K₂[PtCl₄] is:", opts:["Potassium tetrachloroplatinate(II)","Potassium chloroplatinum","Dipotassium platinum chloride","Potassium platinum(IV) chloride"], ans:0, exp:"K₂[PtCl₄]: cation K⁺, anion [PtCl₄]²⁻ = potassium tetrachloroplatinate(II).", diff:"hard", topic:"Coordination Compounds" },

    // Haloalkanes
    { q:"SN2 reaction proceeds with:", opts:["Inversion of configuration","Retention of configuration","Racemization","No stereochemical change"], ans:0, exp:"SN2 is a backside attack leading to complete inversion (Walden inversion).", diff:"hard", topic:"Haloalkanes" },
    { q:"Which is more reactive in SN1: CH₃Cl or (CH₃)₃CCl?", opts:["(CH₃)₃CCl (tertiary)","CH₃Cl (primary)","Both equal","Neither"], ans:0, exp:"SN1 favors tertiary carbocations (more stable). (CH₃)₃CCl is more reactive in SN1.", diff:"hard", topic:"Haloalkanes" },

    // Aldehydes & Ketones
    { q:"Aldehydes give positive Tollens' test because they are:", opts:["Reducing agents","Oxidising agents","Neutral","Basic"], ans:0, exp:"Aldehydes reduce Tollens' reagent (silver mirror test) as they are easily oxidized.", diff:"medium", topic:"Aldehydes & Ketones" },
    { q:"Nucleophilic addition is characteristic of:", opts:["Carbonyl compounds","Alkenes","Alkanes","Benzene"], ans:0, exp:"The C=O group in aldehydes/ketones undergoes nucleophilic addition due to electrophilic carbon.", diff:"medium", topic:"Aldehydes & Ketones" },

    // Biomolecules
    { q:"DNA double helix was proposed by:", opts:["Watson and Crick","Mendel and Morgan","Pauling and Corey","Avery and Griffith"], ans:0, exp:"James Watson and Francis Crick proposed the double helix model of DNA in 1953.", diff:"easy", topic:"Biomolecules" },
    { q:"Proteins are polymers of:", opts:["Amino acids","Glucose","Nucleotides","Fatty acids"], ans:0, exp:"Proteins are polypeptides made of amino acid monomers joined by peptide bonds.", diff:"easy", topic:"Biomolecules" },
    { q:"Vitamin C is also known as:", opts:["Ascorbic acid","Acetic acid","Citric acid","Lactic acid"], ans:0, exp:"Vitamin C = Ascorbic acid. It is a water-soluble antioxidant vitamin.", diff:"easy", topic:"Biomolecules" },
  ],

  // ═══════════════════════════════════════════
  //  BIOLOGY — Class 12 CBSE
  // ═══════════════════════════════════════════
  Biology: [
    // Reproduction
    { q:"Double fertilization in angiosperms involves:", opts:["Fusion with egg and polar nuclei","Fusion with two egg cells","Two separate fertilizations","Fusion with synergids"], ans:0, exp:"Double fertilization: one sperm fuses with egg (zygote), another with polar nuclei (endosperm). Unique to angiosperms.", diff:"medium", topic:"Reproduction in Plants" },
    { q:"Pollen grain represents the:", opts:["Male gametophyte","Female gametophyte","Sporophyte","Zygote"], ans:0, exp:"Pollen grain is the mature male gametophyte in angiosperms.", diff:"easy", topic:"Reproduction in Plants" },
    { q:"The phenomenon of bearing more than one embryo in a seed is:", opts:["Polyembryony","Parthenogenesis","Apomixis","Parthenocarpy"], ans:0, exp:"Polyembryony is the occurrence of more than one embryo in a single seed (e.g., Citrus).", diff:"medium", topic:"Reproduction in Plants" },

    // Human Reproduction
    { q:"Spermatogenesis occurs in:", opts:["Seminiferous tubules","Epididymis","Vas deferens","Prostate gland"], ans:0, exp:"Spermatogenesis (sperm formation) occurs in the seminiferous tubules of testes.", diff:"easy", topic:"Human Reproduction" },
    { q:"Corpus luteum secretes:", opts:["Progesterone","Estrogen","LH","FSH"], ans:0, exp:"Corpus luteum (ruptured follicle post-ovulation) secretes progesterone to maintain pregnancy.", diff:"medium", topic:"Human Reproduction" },
    { q:"The correct sequence of fertilization to implantation is:", opts:["Zygote → Morula → Blastocyst → Implantation","Zygote → Blastocyst → Morula → Implantation","Morula → Zygote → Blastocyst","Blastocyst → Morula → Zygote"], ans:0, exp:"Zygote cleaves to morula (solid ball), then becomes hollow blastocyst which implants in uterus.", diff:"hard", topic:"Human Reproduction" },

    // Genetics
    { q:"Law of Segregation states that:", opts:["Alleles separate during gamete formation","Characters blend in offspring","One gene controls one trait only","Genes are on chromosomes"], ans:0, exp:"Mendel's Law of Segregation: paired alleles separate during meiosis, each gamete gets one allele.", diff:"medium", topic:"Genetics" },
    { q:"Haemophilia is a:", opts:["X-linked recessive disorder","Autosomal dominant disorder","X-linked dominant disorder","Autosomal recessive"], ans:0, exp:"Haemophilia A and B are X-linked recessive disorders — mostly affect males.", diff:"medium", topic:"Genetics" },
    { q:"In DNA, Adenine pairs with:", opts:["Thymine","Guanine","Cytosine","Uracil"], ans:0, exp:"A-T pairing in DNA (2 hydrogen bonds). G-C pairing (3 H-bonds). RNA uses U instead of T.", diff:"easy", topic:"Genetics" },
    { q:"Sickle cell anaemia is caused by:", opts:["Point mutation in β-globin gene","Chromosomal deletion","Non-disjunction","Frameshift mutation"], ans:0, exp:"A single nucleotide substitution (Glu→Val) in β-globin gene causes sickle cell anaemia.", diff:"hard", topic:"Genetics" },

    // Molecular Biology
    { q:"The central dogma of molecular biology is:", opts:["DNA→RNA→Protein","Protein→RNA→DNA","RNA→DNA→Protein","DNA→Protein→RNA"], ans:0, exp:"Central dogma: DNA is transcribed to RNA, which is translated to protein.", diff:"easy", topic:"Molecular Biology" },
    { q:"Restriction enzymes are used to:", opts:["Cut DNA at specific sequences","Replicate DNA","Translate mRNA","Transcribe DNA"], ans:0, exp:"Restriction endonucleases recognize specific palindromic sequences and cut DNA there.", diff:"medium", topic:"Molecular Biology" },
    { q:"Lac operon is an example of:", opts:["Inducible operon","Repressible operon","Constitutive operon","Regulatory operon"], ans:0, exp:"Lac operon is induced by lactose — expressed when lactose is present (inducible operon).", diff:"hard", topic:"Molecular Biology" },

    // Evolution
    { q:"Natural selection is based on:", opts:["Survival of the fittest","Random mutations only","Genetic drift","Lamarckism"], ans:0, exp:"Darwin's natural selection: organisms with better adaptations survive and reproduce more (survival of the fittest).", diff:"easy", topic:"Evolution" },
    { q:"Hardy-Weinberg principle states that allele frequencies:", opts:["Remain constant in absence of evolutionary forces","Change every generation","Depend on mutation rate only","Are always 0.5"], ans:0, exp:"Hardy-Weinberg equilibrium: allele frequencies constant if no mutation, selection, migration, genetic drift, or non-random mating.", diff:"medium", topic:"Evolution" },

    // Ecology
    { q:"An ecosystem is defined as:", opts:["Community + Abiotic environment","All plants in an area","All animals + plants","Only living organisms"], ans:0, exp:"Ecosystem = Biotic community + Abiotic environment (both living and non-living components).", diff:"easy", topic:"Ecology" },
    { q:"The pyramid of energy is always:", opts:["Upright","Inverted","Can be either","Horizontal"], ans:0, exp:"Energy decreases at each trophic level (~10% rule), so pyramid of energy is always upright.", diff:"medium", topic:"Ecology" },
    { q:"Ozone layer is present in:", opts:["Stratosphere","Troposphere","Mesosphere","Thermosphere"], ans:0, exp:"Ozone (O₃) layer exists in the stratosphere (15–35 km altitude), absorbing UV radiation.", diff:"easy", topic:"Ecology" },

    // Biotechnology
    { q:"PCR stands for:", opts:["Polymerase Chain Reaction","Protein Chain Reaction","Polymer Creation Reaction","Plasmid Chain Replication"], ans:0, exp:"PCR = Polymerase Chain Reaction, used to amplify specific DNA sequences in vitro.", diff:"easy", topic:"Biotechnology" },
    { q:"Bt crops are resistant to insects because they produce:", opts:["Cry proteins (insecticidal toxins)","Pesticide residues","Antibiotic enzymes","Digestive inhibitors"], ans:0, exp:"Bt (Bacillus thuringiensis) crops express Cry proteins that are toxic to specific insect larvae.", diff:"medium", topic:"Biotechnology" },
  ],

  // ═══════════════════════════════════════════
  //  COMPUTER SCIENCE — Class 12 CBSE
  // ═══════════════════════════════════════════
  'Computer Science': [
    // Python OOP
    { q:"Which keyword is used to create a class in Python?", opts:["class","define","object","create"], ans:0, exp:"In Python, 'class' keyword is used to define a class: 'class ClassName:'", diff:"easy", topic:"Python & OOP" },
    { q:"What is encapsulation in OOP?", opts:["Binding data and methods together","Inheriting from parent class","Overriding methods","Creating multiple instances"], ans:0, exp:"Encapsulation bundles data (attributes) and methods into a single unit (class) and restricts direct access.", diff:"medium", topic:"Python & OOP" },
    { q:"Which method is called automatically when an object is created?", opts:["__init__","__str__","__del__","__repr__"], ans:0, exp:"__init__ is the constructor method, called automatically when a new object is instantiated.", diff:"easy", topic:"Python & OOP" },
    { q:"Polymorphism means:", opts:["Same interface, different implementations","Multiple inheritance only","Data hiding","Class creation"], ans:0, exp:"Polymorphism allows the same function/method name to behave differently based on the object.", diff:"medium", topic:"Python & OOP" },

    // Data Structures
    { q:"A stack data structure follows:", opts:["LIFO (Last In First Out)","FIFO (First In First Out)","Random access","Sorted order"], ans:0, exp:"Stack: Last In First Out — like a stack of plates, last added is first removed.", diff:"easy", topic:"Data Structures" },
    { q:"Time complexity of binary search is:", opts:["O(log n)","O(n)","O(n²)","O(1)"], ans:0, exp:"Binary search divides search space in half each iteration — O(log n) complexity.", diff:"medium", topic:"Data Structures" },
    { q:"Which data structure uses enqueue and dequeue operations?", opts:["Queue","Stack","Array","Tree"], ans:0, exp:"Queue uses enqueue (insert at rear) and dequeue (remove from front) — FIFO structure.", diff:"easy", topic:"Data Structures" },
    { q:"A linked list is different from an array because:", opts:["Elements are non-contiguous in memory","It is faster for all operations","It uses less memory","It only stores integers"], ans:0, exp:"Linked list nodes can be stored anywhere in memory (linked by pointers), unlike arrays (contiguous).", diff:"medium", topic:"Data Structures" },

    // Networking
    { q:"IP address in IPv4 consists of:", opts:["32 bits","64 bits","128 bits","16 bits"], ans:0, exp:"IPv4 uses 32-bit addresses (4 octets e.g., 192.168.1.1). IPv6 uses 128 bits.", diff:"easy", topic:"Computer Networks" },
    { q:"HTTP stands for:", opts:["HyperText Transfer Protocol","HyperText Transmission Program","High Transfer Text Protocol","HyperText Terminal Protocol"], ans:0, exp:"HTTP = HyperText Transfer Protocol, used for web communication between client and server.", diff:"easy", topic:"Computer Networks" },
    { q:"Which layer of OSI model handles routing?", opts:["Network layer","Data Link layer","Transport layer","Session layer"], ans:0, exp:"The Network layer (Layer 3) handles logical addressing and routing of packets (e.g., IP protocol).", diff:"medium", topic:"Computer Networks" },
    { q:"DNS stands for:", opts:["Domain Name System","Data Network Service","Domain Network System","Distributed Name Service"], ans:0, exp:"DNS (Domain Name System) translates domain names (e.g., google.com) to IP addresses.", diff:"easy", topic:"Computer Networks" },

    // Database (SQL)
    { q:"Which SQL command retrieves data from a table?", opts:["SELECT","INSERT","UPDATE","DELETE"], ans:0, exp:"SELECT is used to query and retrieve data from database tables.", diff:"easy", topic:"SQL & Databases" },
    { q:"Primary key in a database is:", opts:["Unique identifier for each row","Foreign reference","An index only","A calculated column"], ans:0, exp:"Primary key uniquely identifies each record in a table and cannot be NULL.", diff:"easy", topic:"SQL & Databases" },
    { q:"SQL JOIN combines rows from:", opts:["Two or more tables","One table only","Views only","Stored procedures"], ans:0, exp:"SQL JOIN combines rows from two or more tables based on a related column.", diff:"easy", topic:"SQL & Databases" },
    { q:"HAVING clause is used with:", opts:["GROUP BY","WHERE","ORDER BY","JOIN"], ans:0, exp:"HAVING filters groups created by GROUP BY (unlike WHERE which filters individual rows).", diff:"medium", topic:"SQL & Databases" },

    // Boolean Logic
    { q:"A+A̅ = ?", opts:["1","0","A","A̅"], ans:0, exp:"A + A̅ = 1 (Complement law — OR of a variable with its complement is always 1).", diff:"easy", topic:"Boolean Algebra" },
    { q:"De Morgan's first theorem: (A+B)̅ = ?", opts:["A̅·B̅","A̅+B̅","A·B","A+B"], ans:0, exp:"De Morgan's: (A+B)̅ = A̅·B̅ — complement of OR equals AND of complements.", diff:"medium", topic:"Boolean Algebra" },
    { q:"Which gate produces output 1 only when inputs differ?", opts:["XOR","AND","OR","XNOR"], ans:0, exp:"XOR (exclusive OR) gate: output is 1 when inputs are different (0,1 or 1,0).", diff:"easy", topic:"Boolean Algebra" },
  ],

  // ═══════════════════════════════════════════
  //  ENGLISH — Class 12 CBSE
  // ═══════════════════════════════════════════
  English: [
    // Flamingo — Prose
    { q:"'The Last Lesson' by Alphonse Daudet is about:", opts:["Last French lesson before German occupation","A teacher's retirement","A student's last day at school","French Revolution"], ans:0, exp:"'The Last Lesson' depicts the last French language class in Alsace before German rule enforces German as the language.", diff:"medium", topic:"The Last Lesson" },
    { q:"In 'Lost Spring', Saheb and Mukesh represent:", opts:["Children denied education & lost dreams","Rich and poor children","Two cities of India","Government failures"], ans:0, exp:"Saheb (rag-picker) and Mukesh (glass-blower) represent children trapped in poverty with lost educational opportunities.", diff:"medium", topic:"Lost Spring" },
    { q:"The lesson 'Deep Water' by William Douglas deals with:", opts:["Overcoming the fear of water","Marine biology","River pollution","Swimming techniques"], ans:0, exp:"William Douglas narrates his experience of nearly drowning and overcoming his lifelong fear of water.", diff:"easy", topic:"Deep Water" },

    // Flamingo — Poetry
    { q:"'My Mother at Sixty-Six' is a poem by:", opts:["Kamala Das","Rabindranath Tagore","John Keats","William Blake"], ans:0, exp:"'My Mother at Sixty-Six' is written by Kamala Das, expressing anxiety about her aging mother.", diff:"easy", topic:"My Mother at Sixty-Six" },
    { q:"In 'An Elementary School Classroom in a Slum', the poet is:", opts:["Stephen Spender","William Blake","John Donne","T.S. Eliot"], ans:0, exp:"'An Elementary School Classroom in a Slum' is by Stephen Spender, depicting underprivileged children.", diff:"medium", topic:"Elementary School Classroom" },

    // Vistas
    { q:"'The Tiger King' by Kalki is a story about:", opts:["A king obsessed with killing tigers","Conservation of tigers","A circus tiger","A tribal king"], ans:0, exp:"'The Tiger King' satirically depicts the Maharaja of Pratibandapuram who kills 99 tigers to disprove a prophecy.", diff:"medium", topic:"The Tiger King" },
    { q:"'Should Wizard Hit Mommy?' by John Updike raises the theme of:", opts:["Parental authority vs child's imagination","Magic and fantasy","Modern technology","Family conflicts"], ans:0, exp:"The story explores conflict between adult rationalism/authority and a child's imaginative world.", diff:"hard", topic:"Should Wizard Hit Mommy?" },

    // Grammar
    { q:"Identify the figure of speech: 'The wind whispered through the trees':", opts:["Personification","Simile","Metaphor","Alliteration"], ans:0, exp:"Personification: giving human quality (whispering) to non-human entity (wind).", diff:"easy", topic:"Grammar & Figures of Speech" },
    { q:"Passive voice of 'She writes a letter':", opts:["A letter is written by her","A letter was written by her","A letter has been written","She is writing a letter"], ans:0, exp:"Simple present passive: Subject + is/am/are + past participle. 'A letter is written by her.'", diff:"medium", topic:"Grammar & Figures of Speech" },
    { q:"Direct speech: He said, 'I am happy.' Reported speech:", opts:["He said that he was happy","He said that he is happy","He told I was happy","He said he will be happy"], ans:0, exp:"In reported speech, present simple changes to past simple: 'am' → 'was'.", diff:"medium", topic:"Grammar & Figures of Speech" },

    // Writing Skills
    { q:"A notice must include:", opts:["Date, heading, content, issuing authority","Only content","Only date and heading","Signature only"], ans:0, exp:"A formal notice includes: date, heading (NOTICE), content/body, and name/designation of issuing authority.", diff:"easy", topic:"Writing Skills" },
    { q:"Letter to the editor is written to:", opts:["Express opinion on public matter","Apply for a job","Complain to a company","Write to a friend"], ans:0, exp:"Letter to the editor is addressed to a newspaper editor to express views on current issues or public matters.", diff:"easy", topic:"Writing Skills" },
    { q:"An article must begin with:", opts:["A catchy title and introduction","A letter head","A formal salutation","A list of points"], ans:0, exp:"Articles start with an engaging title and an introductory paragraph that hooks the reader.", diff:"easy", topic:"Writing Skills" },

    // Vocabulary
    { q:"The word 'ephemeral' means:", opts:["Lasting for a very short time","Eternal","Powerful","Ancient"], ans:0, exp:"Ephemeral means lasting for a very short time (from Greek 'ephemeros' — lasting a day).", diff:"hard", topic:"Vocabulary" },
    { q:"Synonym of 'Melancholy' is:", opts:["Sadness","Happiness","Anger","Courage"], ans:0, exp:"Melancholy means deep, pensive sadness. Synonyms: sadness, gloom, sorrow, dejection.", diff:"medium", topic:"Vocabulary" },
    { q:"Antonym of 'Benevolent' is:", opts:["Malevolent","Generous","Kind","Helpful"], ans:0, exp:"Benevolent means well-wishing/kind. Antonym: Malevolent (wanting harm to others).", diff:"medium", topic:"Vocabulary" },
  ],

  // ═══════════════════════════════════════════
  //  ACCOUNTANCY — Class 12 CBSE
  // ═══════════════════════════════════════════
  Accountancy: [
    // Partnership
    { q:"In the absence of a partnership deed, profit sharing ratio is:", opts:["Equal","Based on capital","3:2:1","Based on experience"], ans:0, exp:"As per Partnership Act 1932, in absence of deed, profits are shared equally among partners.", diff:"easy", topic:"Partnership Fundamentals" },
    { q:"Goodwill is a:", opts:["Intangible asset","Tangible asset","Current asset","Fictitious asset"], ans:0, exp:"Goodwill represents the reputation of a business — an intangible but real asset.", diff:"easy", topic:"Partnership Fundamentals" },
    { q:"When a new partner is admitted, existing partners' ratio changes to:", opts:["Sacrifice ratio","New ratio","Old ratio","Capital ratio"], ans:0, exp:"Sacrificing ratio = Old ratio − New ratio; existing partners sacrifice for the new partner.", diff:"medium", topic:"Admission of Partner" },
    { q:"Revaluation account is a:", opts:["Nominal account","Real account","Personal account","Temporary account"], ans:0, exp:"Revaluation account records profits/losses on revaluation of assets/liabilities — it's a nominal account.", diff:"medium", topic:"Revaluation" },

    // Company Accounts
    { q:"Minimum subscription is:", opts:["90% of issued capital","50% of issued capital","100% of issued capital","75% of issued capital"], ans:0, exp:"As per SEBI regulations, company must receive minimum 90% subscription before proceeding with allotment.", diff:"hard", topic:"Company Accounts" },
    { q:"Debentures are:", opts:["Borrowed capital (debt)","Owned capital (equity)","Short-term borrowing","Owner's fund"], ans:0, exp:"Debentures are debt instruments — the company borrows money and pays fixed interest to debenture holders.", diff:"easy", topic:"Company Accounts" },
    { q:"Share premium is shown under:", opts:["Reserves & Surplus","Share Capital","Current Liabilities","Long-term Provisions"], ans:0, exp:"Securities Premium (Share Premium) is shown under Reserves & Surplus in the Balance Sheet.", diff:"medium", topic:"Company Accounts" },

    // Financial Statements
    { q:"Gross Profit = ?", opts:["Revenue − Cost of Goods Sold","Revenue − All Expenses","Net Profit + Expenses","Operating Profit"], ans:0, exp:"Gross Profit = Net Revenue − Cost of Goods Sold (COGS). Before deducting operating expenses.", diff:"easy", topic:"Financial Statements" },
    { q:"Current Ratio = ?", opts:["Current Assets / Current Liabilities","Total Assets / Total Liabilities","Net Profit / Revenue","Capital / Debt"], ans:0, exp:"Current Ratio = Current Assets / Current Liabilities. Ideal value is 2:1.", diff:"easy", topic:"Financial Ratios" },
    { q:"Working Capital = ?", opts:["Current Assets − Current Liabilities","Fixed Assets − Long-term Liabilities","Total Assets − Total Liabilities","Gross Profit − Net Profit"], ans:0, exp:"Working Capital = CA − CL. Measures short-term liquidity of a business.", diff:"easy", topic:"Financial Ratios" },

    // Cash Flow
    { q:"Cash flow from operations includes:", opts:["Net profit adjusted for non-cash items","Purchase of fixed assets","Payment of dividends","Issue of shares"], ans:0, exp:"Operating cash flow = Profit ± changes in working capital ± non-cash adjustments (depreciation etc.).", diff:"medium", topic:"Cash Flow Statement" },
    { q:"Depreciation is added back in cash flow from operations because:", opts:["It is a non-cash expense","It reduces profit","It is an asset","It reduces tax"], ans:0, exp:"Depreciation reduces profit but doesn't involve cash outflow, so it's added back to reconcile profit to cash.", diff:"medium", topic:"Cash Flow Statement" },
  ],

  // ═══════════════════════════════════════════
  //  ECONOMICS — Class 12 CBSE
  // ═══════════════════════════════════════════
  Economics: [
    // Micro Economics
    { q:"Law of Demand states that price and demand are:", opts:["Inversely related","Directly related","Not related","Positively correlated"], ans:0, exp:"Law of Demand: as price rises, quantity demanded falls (inverse relationship), ceteris paribus.", diff:"easy", topic:"Theory of Demand" },
    { q:"Price Elasticity of Demand (PED) = ?", opts:["% change in quantity / % change in price","% change in price / % change in quantity","Change in Q / Change in P","Q × P"], ans:0, exp:"PED = (ΔQ/Q) ÷ (ΔP/P) = percentage change in quantity demanded / percentage change in price.", diff:"medium", topic:"Theory of Demand" },
    { q:"Consumer surplus is:", opts:["What consumers are willing to pay minus what they actually pay","Total expenditure by consumers","Profit of producers","Excess supply"], ans:0, exp:"Consumer surplus = Willingness to pay − Actual price paid. It represents benefit to buyers.", diff:"medium", topic:"Consumer Equilibrium" },
    { q:"Perfect competition is characterized by:", opts:["Many sellers, homogeneous products, free entry","Few sellers, differentiated products","One seller","Barriers to entry"], ans:0, exp:"Perfect competition: many buyers & sellers, identical products, perfect information, free entry & exit.", diff:"easy", topic:"Market Structure" },
    { q:"In monopoly, the firm is a:", opts:["Price maker","Price taker","Price follower","Price leader only in oligopoly"], ans:0, exp:"A monopolist is the sole producer and sets (makes) its own price, unlike competitive firms (price takers).", diff:"easy", topic:"Market Structure" },

    // Macro Economics
    { q:"GDP stands for:", opts:["Gross Domestic Product","General Domestic Product","Gross Domestic Profit","General Domestic Progress"], ans:0, exp:"GDP = Gross Domestic Product: total value of goods and services produced within a country in a year.", diff:"easy", topic:"National Income" },
    { q:"The multiplier effect states that an increase in investment leads to:", opts:["A greater increase in national income","An equal increase in income","A smaller increase in income","No change in income"], ans:0, exp:"Multiplier = 1/(1−MPC). Investment increase leads to larger total income increase through spending rounds.", diff:"medium", topic:"National Income" },
    { q:"Repo rate is the rate at which:", opts:["RBI lends to commercial banks","Commercial banks lend to public","Government borrows from RBI","Banks lend to each other"], ans:0, exp:"Repo Rate: rate at which RBI lends short-term money to commercial banks against securities.", diff:"easy", topic:"Money & Banking" },
    { q:"Deficit financing refers to:", opts:["Printing money to cover fiscal deficit","Borrowing from foreign countries only","Tax revenue exceeding expenditure","Reducing government spending"], ans:0, exp:"Deficit financing = government printing currency or borrowing from RBI to cover budget deficit.", diff:"medium", topic:"Government Budget" },
    { q:"Balance of Payments includes:", opts:["Current account + Capital account","Only exports and imports","Only foreign investments","Trade balance only"], ans:0, exp:"BOP = Current Account (trade, services, transfers) + Capital Account (investments, loans) + Errors.", diff:"medium", topic:"Balance of Payments" },
  ],
};

// ── Curiculum Map ──────────────────────────
const SUBJECT_TOPICS = {
  Mathematics: ["Relations & Functions","Inverse Trigonometry","Matrices & Determinants","Continuity & Differentiability","Applications of Derivatives","Integrals","Differential Equations","Vectors","3D Geometry","Probability"],
  Physics: ["Electrostatics","Current Electricity","Magnetic Effects","Electromagnetic Induction","Optics","Dual Nature","Atoms & Nuclei","Semiconductors"],
  Chemistry: ["Solutions","Electrochemistry","Chemical Kinetics","Surface Chemistry","Coordination Compounds","Haloalkanes","Aldehydes & Ketones","Biomolecules"],
  Biology: ["Reproduction in Plants","Human Reproduction","Genetics","Molecular Biology","Evolution","Ecology","Biotechnology"],
  'Computer Science': ["Python & OOP","Data Structures","Computer Networks","SQL & Databases","Boolean Algebra"],
  English: ["The Last Lesson","Lost Spring","Deep Water","My Mother at Sixty-Six","Elementary School Classroom","The Tiger King","Should Wizard Hit Mommy?","Grammar & Figures of Speech","Writing Skills","Vocabulary"],
  Accountancy: ["Partnership Fundamentals","Admission of Partner","Revaluation","Company Accounts","Financial Statements","Financial Ratios","Cash Flow Statement"],
  Economics: ["Theory of Demand","Consumer Equilibrium","Market Structure","National Income","Money & Banking","Government Budget","Balance of Payments"],
};

// ── State ─────────────────────────────────
let quizState = {
  subject: null, difficulty: 'easy', questions: [],
  current: 0, score: 0, answers: [], streak: 0,
  bestStreak: 0, xp: 0, timerInterval: null,
  timeLimit: 30, timeLeft: 30, selectedTopic: null
};

// ── Init ──────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderQuizSubjects();
  renderLeaderboard();
  updateSidebarStats();
});

function renderQuizSubjects() {
  const grid = document.getElementById('quizSubjectGrid');
  if (!grid) return;

  const allSubjects = Object.keys(QUESTION_BANK);
  const storedSubjects = getSubjects();

  // Show all Class 12 subjects always
  const displaySubs = allSubjects.map(name => {
    const stored = storedSubjects.find(s => s.name === name);
    return { name, emoji: stored?.emoji || getDefaultEmoji(name) };
  });

  grid.innerHTML = displaySubs.map(s => subjectBtn(s)).join('');
}

function getDefaultEmoji(name) {
  const map = {
    Mathematics:'📐', Physics:'⚛️', Chemistry:'🧪',
    Biology:'🌿', 'Computer Science':'💻', English:'📚',
    Accountancy:'📒', Economics:'📊'
  };
  return map[name] || '📖';
}

function subjectBtn(s) {
  const count = (QUESTION_BANK[s.name] || []).length;
  return `<button class="quiz-subject-btn" id="qsub-${s.name.replace(/ /g,'-')}" onclick="selectQuizSubject('${s.name}')">
    <span class="emoji">${s.emoji || getDefaultEmoji(s.name)}</span>
    <span>${s.name}</span>
    <span style="font-size:0.65rem;color:var(--text-muted);margin-top:-4px;">${count} questions</span>
  </button>`;
}

function selectQuizSubject(name) {
  if (!QUESTION_BANK[name]) {
    showToast(`No questions available for ${name} yet.`, 'warning', '⚠️'); return;
  }
  quizState.subject = name;
  document.querySelectorAll('.quiz-subject-btn').forEach(b => b.classList.remove('selected'));
  document.getElementById('qsub-' + name.replace(/ /g,'-'))?.classList.add('selected');

  // Update topic filter if available
  renderTopicFilter(name);
}

function renderTopicFilter(subjectName) {
  const topicWrap = document.getElementById('topicFilterWrap');
  if (!topicWrap) return;
  const topics = SUBJECT_TOPICS[subjectName] || [];
  if (topics.length === 0) { topicWrap.style.display='none'; return; }

  topicWrap.style.display = 'block';
  const topicGrid = document.getElementById('topicFilterGrid');
  if (!topicGrid) return;

  quizState.selectedTopic = null;
  topicGrid.innerHTML = `<button class="difficulty-btn active" id="topic-all" onclick="selectTopic(null)">All Topics</button>` +
    topics.map(t => `<button class="difficulty-btn" id="topic-${t.replace(/ /g,'_')}" onclick="selectTopic('${t}')">${t}</button>`).join('');
}

function selectTopic(topic) {
  quizState.selectedTopic = topic;
  document.querySelectorAll('#topicFilterGrid .difficulty-btn').forEach(b => b.classList.remove('active'));
  const id = topic ? 'topic-' + topic.replace(/ /g,'_') : 'topic-all';
  document.getElementById(id)?.classList.add('active');
}

function setDifficulty(level) {
  quizState.difficulty = level;
  document.querySelectorAll('.difficulty-btn[id^="diff-"]').forEach(b => b.classList.remove('active'));
  document.getElementById('diff-' + level)?.classList.add('active');
}

// ── Start Quiz ────────────────────────────
function startQuiz() {
  if (!quizState.subject) {
    showToast('Please select a subject first!', 'warning', '⚠️'); return;
  }

  const count    = parseInt(document.getElementById('questionCount')?.value || 10);
  const timePerQ = parseInt(document.getElementById('timePerQ')?.value || 30);
  let bank       = QUESTION_BANK[quizState.subject] || [];

  // Filter by topic if selected
  if (quizState.selectedTopic) {
    bank = bank.filter(q => q.topic === quizState.selectedTopic);
    if (bank.length === 0) bank = QUESTION_BANK[quizState.subject];
  }

  // Filter by difficulty
  let filtered = quizState.difficulty === 'mixed'
    ? bank
    : bank.filter(q => q.diff === quizState.difficulty);
  if (filtered.length === 0) filtered = bank;

  const shuffled = [...filtered].sort(() => Math.random() - 0.5);
  quizState.questions  = shuffled.slice(0, Math.min(count, shuffled.length));
  quizState.current    = 0;
  quizState.score      = 0;
  quizState.answers    = [];
  quizState.streak     = 0;
  quizState.bestStreak = 0;
  quizState.xp         = 0;
  quizState.timeLimit  = timePerQ;

  document.getElementById('setupScreen').classList.add('hidden');
  document.getElementById('quizScreen').classList.remove('hidden');
  document.getElementById('resultsScreen').classList.add('hidden');
  document.getElementById('reviewScreen').classList.add('hidden');

  document.getElementById('totalQNum').textContent = quizState.questions.length;
  renderQuestion();
}

// ── Render Question ───────────────────────
function renderQuestion() {
  const q = quizState.questions[quizState.current];
  if (!q) return;

  document.getElementById('currentQNum').textContent = quizState.current + 1;
  const xpPct = (quizState.current / quizState.questions.length) * 100;
  document.getElementById('quizXpBar').style.width = xpPct + '%';
  document.getElementById('earnedXp').textContent = quizState.xp;
  document.getElementById('currentStreakVal').textContent = quizState.streak;

  const diffColors = { easy:'badge-low', medium:'badge-medium', hard:'badge-high' };
  document.getElementById('qSubjectTag').textContent = getDefaultEmoji(quizState.subject) + ' ' + (q.topic || quizState.subject);
  document.getElementById('qDiffTag').className = 'badge ' + (diffColors[q.diff] || 'badge-purple');
  document.getElementById('qDiffTag').textContent = q.diff.charAt(0).toUpperCase() + q.diff.slice(1);

  document.getElementById('questionText').textContent = q.q;

  const letters = ['A','B','C','D'];
  const opts    = document.getElementById('optionsGrid');
  const shuffledOpts = q.opts.map((o, i) => ({ text: o, orig: i }))
    .sort(() => Math.random() - 0.5);
  const correctShuffledIdx = shuffledOpts.findIndex(o => o.orig === q.ans);

  opts.innerHTML = shuffledOpts.map((opt, i) => `
    <div class="quiz-option" id="opt-${i}" onclick="selectAnswer(${i}, ${correctShuffledIdx})"
      style="animation: slideUp 0.3s ease ${i * 0.07}s both;">
      <div class="quiz-letter">${letters[i]}</div>
      <span>${opt.text}</span>
    </div>
  `).join('');

  const expBox = document.getElementById('explanationBox');
  expBox.style.display = 'none';
  expBox.className = 'explanation-box';

  const nextBtn = document.getElementById('nextBtn');
  nextBtn.disabled = true;
  nextBtn.style.opacity = '0.5';
  nextBtn.textContent = quizState.current < quizState.questions.length - 1 ? 'Next Question →' : 'See Results →';

  startQuestionTimer();
  quizState.shuffledOpts = shuffledOpts;
  quizState.correctShuffledIdx = correctShuffledIdx;
}

// ── Timer ─────────────────────────────────
function startQuestionTimer() {
  clearInterval(quizState.timerInterval);

  if (quizState.timeLimit === 0) {
    document.getElementById('timerWrap').style.display = 'none';
    return;
  }

  document.getElementById('timerWrap').style.display = 'block';
  quizState.timeLeft = quizState.timeLimit;
  updateTimerUI();

  quizState.timerInterval = setInterval(() => {
    quizState.timeLeft--;
    updateTimerUI();
    if (quizState.timeLeft <= 0) {
      clearInterval(quizState.timerInterval);
      timeUp();
    }
  }, 1000);
}

function updateTimerUI() {
  const fill = document.getElementById('timerFill');
  const disp = document.getElementById('timerDisplay');
  const pct  = (quizState.timeLeft / quizState.timeLimit) * 100;
  if (disp) disp.textContent = quizState.timeLeft + 's';
  if (fill) {
    fill.style.width = pct + '%';
    fill.className   = 'q-timer-fill' + (quizState.timeLeft <= 10 ? ' warn' : '');
  }
}

function timeUp() {
  showToast("Time's up! ⏰", 'warning', '⏰');
  quizState.answers.push({ selected: -1, correct: false, q: quizState.questions[quizState.current] });
  quizState.streak = 0;
  updateStreakUI();

  const expBox = document.getElementById('explanationBox');
  expBox.textContent = "⏰ Time's up! " + quizState.questions[quizState.current].exp;
  expBox.className   = 'explanation-box wrong';
  expBox.style.display = 'block';

  const nextBtn = document.getElementById('nextBtn');
  nextBtn.disabled     = false;
  nextBtn.style.opacity = '1';

  document.querySelectorAll('.quiz-option').forEach((opt, i) => {
    opt.onclick = null;
    if (i === quizState.correctShuffledIdx) opt.classList.add('correct');
  });
}

// ── Select Answer ─────────────────────────
function selectAnswer(selectedIdx, correctIdx) {
  clearInterval(quizState.timerInterval);

  const isCorrect = selectedIdx === correctIdx;
  const q         = quizState.questions[quizState.current];

  quizState.answers.push({ selected: selectedIdx, correct: isCorrect, q, correctIdx, shuffledOpts: quizState.shuffledOpts });

  document.querySelectorAll('.quiz-option').forEach((opt, i) => {
    opt.onclick = null;
    if (i === correctIdx)  opt.classList.add('correct');
    if (i === selectedIdx && !isCorrect) opt.classList.add('wrong');
    if (i === selectedIdx)  opt.classList.add('selected');
  });

  const expBox = document.getElementById('explanationBox');
  expBox.innerHTML = (isCorrect ? '✅ Correct! ' : '❌ Wrong! ') + q.exp;
  expBox.className = 'explanation-box ' + (isCorrect ? 'correct' : 'wrong');
  expBox.style.display = 'block';

  if (isCorrect) {
    quizState.score++;
    quizState.streak++;
    quizState.bestStreak = Math.max(quizState.bestStreak, quizState.streak);
    const xpEarned = 10 + (quizState.streak > 3 ? 5 * quizState.streak : 0);
    quizState.xp += xpEarned;
    if (quizState.streak >= 3) showStreakBadge('🔥 ' + quizState.streak + 'x Combo!');
    showToast(`+${xpEarned} XP 🎉`, 'success', '⚡', 1500);
  } else {
    quizState.streak = 0;
    showToast('Not quite! Check the explanation 📖', 'error', '❌', 2000);
  }

  updateStreakUI();

  const nextBtn = document.getElementById('nextBtn');
  nextBtn.disabled     = false;
  nextBtn.style.opacity = '1';
}

function updateStreakUI() {
  document.getElementById('currentStreakVal').textContent = quizState.streak;
  document.getElementById('streakEmoji').textContent = quizState.streak >= 3 ? '🔥' : '✨';
}

function showStreakBadge(text) {
  const badge = document.createElement('div');
  badge.className = 'streak-badge';
  badge.textContent = text;
  document.body.appendChild(badge);
  setTimeout(() => badge.remove(), 1400);
}

// ── Navigation ────────────────────────────
function nextQuestion() {
  quizState.current++;
  if (quizState.current >= quizState.questions.length) showResults();
  else renderQuestion();
}

function skipQuestion() {
  clearInterval(quizState.timerInterval);
  quizState.answers.push({ selected: -1, correct: false, q: quizState.questions[quizState.current] });
  quizState.streak = 0;
  quizState.current++;
  if (quizState.current >= quizState.questions.length) showResults();
  else { updateStreakUI(); renderQuestion(); }
}

// ── Results ───────────────────────────────
function showResults() {
  clearInterval(quizState.timerInterval);
  document.getElementById('quizScreen').classList.add('hidden');
  document.getElementById('resultsScreen').classList.remove('hidden');

  const total   = quizState.questions.length;
  const correct = quizState.score;
  const wrong   = total - correct;
  const pct     = Math.round((correct / total) * 100);

  const grades = [
    { min:90, emoji:'🏆', msg:"Outstanding! You're a master!", cls:'grad-text-green' },
    { min:75, emoji:'🌟', msg:'Excellent work! Keep it up!',   cls:'grad-text-purple' },
    { min:60, emoji:'👍', msg:"Good job! Room to improve.",    cls:'grad-text-blue' },
    { min:40, emoji:'📚', msg:"Keep studying, you'll get there!", cls:'grad-text-pink' },
    { min:0,  emoji:'💪', msg:"Don't give up! Practice more.", cls:'text-danger' },
  ];
  const grade = grades.find(g => pct >= g.min);

  document.getElementById('resultEmoji').textContent    = grade.emoji;
  document.getElementById('resultScore').textContent    = pct + '%';
  document.getElementById('resultScore').className      = 'result-score ' + grade.cls;
  document.getElementById('resultMsg').textContent      = grade.msg;
  document.getElementById('resultSub').textContent      = `You answered ${correct} out of ${total} correctly`;
  document.getElementById('res-correct').textContent    = correct;
  document.getElementById('res-wrong').textContent      = wrong;
  document.getElementById('res-xp').textContent         = '+' + quizState.xp + ' XP';

  const mistakes = quizState.answers.filter(a => !a.correct && a.q);
  const mistakeEl = document.getElementById('mistakeAnalysis');
  if (mistakes.length > 0) {
    mistakeEl.innerHTML = `
      <h3 style="font-weight:700;font-size:0.875rem;margin-bottom:10px;color:var(--high);">⚠️ Needs Review (${mistakes.length})</h3>
      ${mistakes.map(a => `
        <div style="padding:10px 14px;background:rgba(255,77,109,0.07);border:1px solid rgba(255,77,109,0.15);border-radius:var(--radius-md);margin-bottom:8px;font-size:0.8rem;">
          <div style="font-weight:600;margin-bottom:2px;">${a.q.q}</div>
          <div style="color:var(--text-muted);font-size:0.72rem;margin-bottom:2px;">Topic: ${a.q.topic || quizState.subject}</div>
          <div style="color:var(--accent-3);">✅ Correct: ${a.q.opts[a.q.ans]}</div>
        </div>`).join('')}`;
  } else {
    mistakeEl.innerHTML = `<div style="text-align:center;padding:16px;color:var(--accent-3);font-weight:700;">🎉 Perfect Score! No mistakes!</div>`;
  }

  Store.update('total_xp', v => (v || 1240) + quizState.xp, 0);
  Store.update('best_streak', v => Math.max(v || 0, quizState.bestStreak), 0);
  Store.update('total_questions', v => (v || 0) + total, 0);

  document.getElementById('xpCount').textContent = Store.get('total_xp', 1240).toLocaleString() + ' XP';

  if (pct >= 70) spawnConfetti();
}

function spawnConfetti() {
  const colors = ['#6c63ff','#ff6584','#43e97b','#f7971e','#00c9ff','#fff'];
  for (let i = 0; i < 60; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.cssText = `
      left: ${Math.random() * 100}vw;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      width: ${Math.random() * 10 + 6}px;
      height: ${Math.random() * 10 + 6}px;
      border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
      animation-duration: ${Math.random() * 2 + 2}s;
      animation-delay: ${Math.random() * 0.5}s;
    `;
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 3500);
  }
}

// ── Review ────────────────────────────────
function reviewAnswers() {
  document.getElementById('resultsScreen').classList.add('hidden');
  document.getElementById('reviewScreen').classList.remove('hidden');

  const list    = document.getElementById('reviewList');
  const letters = ['A','B','C','D'];

  list.innerHTML = quizState.answers.map((a, qi) => {
    const q = a.q;
    if (!q) return '';
    const opts = a.shuffledOpts || q.opts.map((t, i) => ({ text: t, orig: i }));

    return `
      <div class="quiz-card" style="padding:24px;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
          <span style="font-weight:800;font-size:1.1rem;">${qi + 1}.</span>
          <div style="flex:1;font-weight:700;font-size:1rem;">${q.q}</div>
          <span class="badge ${a.correct ? 'badge-low' : 'badge-high'}">${a.correct ? '✅ Correct' : '❌ Wrong'}</span>
        </div>
        <div style="font-size:0.72rem;color:var(--text-muted);margin-bottom:16px;">📌 Topic: ${q.topic || 'General'} &nbsp;|&nbsp; Difficulty: ${q.diff}</div>
        <div class="options-grid" style="pointer-events:none;">
          ${opts.map((opt, i) => {
            let cls = '';
            if (i === a.correctIdx)   cls = 'correct';
            if (i === a.selected && !a.correct) cls = 'wrong';
            return `<div class="quiz-option ${cls}"><div class="quiz-letter">${letters[i]}</div><span>${opt.text}</span></div>`;
          }).join('')}
        </div>
        <div class="explanation-box ${a.correct ? 'correct' : 'wrong'}" style="display:block;margin-top:12px;">
          💡 ${q.exp}
        </div>
      </div>`;
  }).join('');
}

function backToResults() {
  document.getElementById('reviewScreen').classList.add('hidden');
  document.getElementById('resultsScreen').classList.remove('hidden');
}

function retakeQuiz() {
  document.getElementById('resultsScreen').classList.add('hidden');
  document.getElementById('setupScreen').classList.remove('hidden');
}

// ── Sidebar Stats ─────────────────────────
function updateSidebarStats() {
  const total   = Store.get('total_questions', 0);
  const bestStr = Store.get('best_streak', 0);
  if (document.getElementById('totalQuestions')) document.getElementById('totalQuestions').textContent = total;
  if (document.getElementById('bestStreak'))     document.getElementById('bestStreak').textContent     = bestStr;
}

function renderLeaderboard() {
  const lb = document.getElementById('leaderboard');
  if (!lb) return;
  const leaders = [
    { name: 'You',    xp: Store.get('total_xp', 1240), avatar: 'S', rank: 1 },
    { name: 'Alex',   xp: 980,  avatar: 'A', rank: 2 },
    { name: 'Priya',  xp: 850,  avatar: 'P', rank: 3 },
  ];
  lb.innerHTML = leaders.map((l, i) => `
    <div style="display:flex;align-items:center;gap:8px;padding:6px 8px;background:${i===0?'rgba(108,99,255,0.1)':'transparent'};border-radius:var(--radius-md);">
      <span style="font-size:0.8rem;font-weight:800;color:var(--text-muted);width:16px;">${l.rank}</span>
      <div style="width:26px;height:26px;border-radius:50%;background:var(--grad-purple);display:flex;align-items:center;justify-content:center;font-size:0.7rem;font-weight:800;">${l.avatar}</div>
      <span style="flex:1;font-size:0.8rem;font-weight:600;${i===0?'color:var(--accent)':''}">${l.name}</span>
      <span style="font-size:0.72rem;color:var(--text-muted);">${l.xp.toLocaleString()}</span>
    </div>`
  ).join('');
}
