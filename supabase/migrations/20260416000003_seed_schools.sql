-- Seed: 45 schools from school_connect source data.
-- statut values are mapped:
--   exact 'En attente'           → status='En attente',  description=NULL
--   contains 'Rendez vous'/'APPELEZ'/'lettre' → status='Contacté', detail in description
--   contains 'déjà une autre'/'non recevable' → status='Refusé',   detail in description
--   everything else              → status='En attente',  detail in description

INSERT INTO public.schools (ecole, lieu, promoteur, phone, status, description)
VALUES
  ('International School of Lubumbashi',  'Plateau Karavia, Lubumbashi', '—', '—', 'En attente', NULL),
  ('EGRA International School',           'Plateau Karavia, Lubumbashi', '—', '—', 'En attente', NULL),
  ('Moutarde School',                     'Plateau Karavia, Lubumbashi', '—', '—', 'En attente', NULL),
  ('Collège SALEM',                       'Golf Météo',                  '—', '—', 'En attente', NULL),
  ('Collège Le Noble',                    'Plateau Karavia, Lubumbashi', '—', '—', 'Refusé',     'Ils ont déjà une autre application'),
  ('CS Les Petits Anges',                 'Lubumbashi',                  '—', '—', 'Refusé',     'Ils ont déjà une autre application'),
  ('CS Eden',                             'Lubumbashi',                  '—', '—', 'En attente', 'En attente de l''appreciation de l''informaticien'),
  ('CS Lumière',                          'Lubumbashi',                  '—', '—', 'En attente', 'En attente de la reponse du promoteur'),
  ('CS La Référence',                     'Lubumbashi',                  '—', '—', 'En attente', NULL),
  ('CS Maman Olive Lembe',                'Lubumbashi',                  '—', '—', 'En attente', 'Année prochaine'),
  ('CS Saint André',                      'Lubumbashi',                  '—', '—', 'En attente', 'Année prochaine'),
  ('CS Saint François',                   'Lubumbashi',                  '—', '—', 'En attente', 'Année prochaine'),
  ('CS Les Bourgeons',                    'Lubumbashi',                  '—', '—', 'En attente', 'Année prochaine'),
  ('CS Don Bosco',                        'Lubumbashi',                  '—', '—', 'En attente', 'En attente de la presentation au mois de mai'),
  ('CS La Sagesse',                       'Lubumbashi',                  '—', '—', 'En attente', NULL),
  ('CS Les Élites',                       'Lubumbashi',                  '—', '—', 'En attente', 'Repasser a la fin des vacances'),
  ('CS Nzambe Malamu',                    'Lubumbashi',                  '—', '—', 'En attente', NULL),
  ('CS Les Génies',                       'Lubumbashi',                  '—', '—', 'En attente', 'Repasser a la fin des vacances'),
  ('CS La Grâce',                         'Lubumbashi',                  '—', '—', 'En attente', 'En attente du conseil des parents'),
  ('CS Les Leaders',                      'Lubumbashi',                  '—', '—', 'Contacté',   'Rendez vous vendredi'),
  ('CS Horizon',                          'Lubumbashi',                  '—', '—', 'Refusé',     'Ils ont déjà une autre application'),
  ('CS Le Jourdain',                      'Lubumbashi',                  '—', '—', 'Contacté',   'La lettre encours de traitement'),
  ('CS Sainte Rita',                      'Lubumbashi',                  '—', '—', 'Contacté',   'La lettre encours de traitement'),
  ('CS Victoire',                         'Lubumbashi',                  '—', '—', 'En attente', NULL),
  ('CS Les Étoiles',                      'Lubumbashi',                  '—', '—', 'En attente', NULL),
  ('CS L''Excellence',                    'Lubumbashi',                  '—', '—', 'En attente', 'Année prochaine'),
  ('CS Les Champions',                    'Lubumbashi',                  '—', '—', 'En attente', NULL),
  ('CS Nouvelle Génération',              'Lubumbashi',                  '—', '—', 'En attente', NULL),
  ('CS Le Progrès',                       'Lubumbashi',                  '—', '—', 'En attente', NULL),
  ('CS Espoir',                           'Lubumbashi',                  '—', '—', 'En attente', NULL),
  ('CS Les Aiglons',                      'Lubumbashi',                  '—', '—', 'En attente', NULL),
  ('CS Les Visionnaires',                 'Lubumbashi',                  '—', '—', 'En attente', NULL),
  ('CS Les Élèves Modèles',               'Lubumbashi',                  '—', '—', 'Contacté',   'Rendez vous vendredi avec la promotrice'),
  ('CS Les Savants',                      'Lubumbashi',                  '—', '—', 'En attente', 'A repasser pendant les vacances'),
  ('CS Les Leaders de Demain',            'Lubumbashi',                  '—', '—', 'Contacté',   'Rendez vous lundi matin'),
  ('CS Gécamines School',                 'Lubumbashi',                  '—', '—', 'Refusé',     'Projet non recevable par la Gecamines'),
  ('CS Les Élites Plus',                  'Lubumbashi',                  '—', '—', 'Contacté',   'Rendez vous lundi matin'),
  ('CS Les Innovateurs',                  'Lubumbashi',                  '—', '—', 'En attente', NULL),
  ('CS Catholique Saint Paul',            'Lubumbashi',                  '—', '—', 'Contacté',   'Rendez vous demain avec le curé'),
  ('CS Les Érudits',                      'Lubumbashi',                  '—', '—', 'Contacté',   'Appeler le mercredi'),
  ('CS Les Petits Génies',                'Lubumbashi',                  '—', '—', 'En attente', NULL),
  ('CS Les Ambitieux',                    'Lubumbashi',                  '—', '—', 'En attente', 'Repasser le lundi'),
  ('CS Les Stratèges',                    'Lubumbashi',                  '—', '—', 'En attente', NULL),
  ('CS Les Brillants',                    'Lubumbashi',                  '—', '—', 'En attente', 'En attente de la lettre'),
  ('CS Les Leaders Académiques',          'Lubumbashi',                  '—', '—', 'Contacté',   'Rendez vous mardi 21 Avril');
