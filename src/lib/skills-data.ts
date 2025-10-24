
export interface Skill {
  id: string;
  name: string;
  other_names: string[];
  category: 'Frontend' | 'Backend' | 'Database' | 'DevOps & Cloud' | 'Mobile' | 'Data Science' | 'Management' | 'Design' | 'Soft Skills' | 'Human Resources' | 'Sales' | 'Marketing';
  related_skills: string[];
}

export const skillsData: Skill[] = [
  // Frontend
  { id: 'react', name: 'React', other_names: ['React.js', 'ReactJS'], category: 'Frontend', related_skills: ['javascript', 'typescript', 'redux', 'nextjs', 'html5', 'css3'] },
  { id: 'javascript', name: 'JavaScript', other_names: ['js'], category: 'Frontend', related_skills: ['react', 'nodejs', 'typescript', 'html5', 'css3'] },
  { id: 'typescript', name: 'TypeScript', other_names: ['ts'], category: 'Frontend', related_skills: ['react', 'nodejs', 'javascript', 'angular'] },
  { id: 'angular', name: 'Angular', other_names: ['Angular.js'], category: 'Frontend', related_skills: ['typescript', 'javascript'] },
  { id: 'vue', name: 'Vue.js', other_names: ['Vue'], category: 'Frontend', related_skills: ['javascript', 'vuex'] },
  { id: 'nextjs', name: 'Next.js', other_names: [], category: 'Frontend', related_skills: ['react', 'nodejs', 'vercel'] },
  { id: 'redux', name: 'Redux', other_names: [], category: 'Frontend', related_skills: ['react', 'javascript'] },
  { id: 'html5', name: 'HTML5', other_names: ['html'], category: 'Frontend', related_skills: ['css3', 'javascript'] },
  { id: 'css3', name: 'CSS3', other_names: ['css'], category: 'Frontend', related_skills: ['html5', 'sass', 'tailwind'] },
  { id: 'sass', name: 'SASS', other_names: ['scss'], category: 'Frontend', related_skills: ['css3', 'html5'] },
  { id: 'tailwind', name: 'Tailwind CSS', other_names: [], category: 'Frontend', related_skills: ['css3', 'react', 'nextjs'] },
  
  // Backend
  { id: 'nodejs', name: 'Node.js', other_names: ['NodeJS'], category: 'Backend', related_skills: ['javascript', 'typescript', 'express', 'mongodb', 'rest_apis'] },
  { id: 'express', name: 'Express.js', other_names: ['Express'], category: 'Backend', related_skills: ['nodejs', 'javascript'] },
  { id: 'python', name: 'Python', other_names: [], category: 'Backend', related_skills: ['django', 'flask', 'data_analysis', 'machine_learning'] },
  { id: 'django', name: 'Django', other_names: [], category: 'Backend', related_skills: ['python', 'rest_apis'] },
  { id: 'flask', name: 'Flask', other_names: [], category: 'Backend', related_skills: ['python'] },
  { id: 'java', name: 'Java', other_names: [], category: 'Backend', related_skills: ['spring_boot', 'sql'] },
  { id: 'spring_boot', name: 'Spring Boot', other_names: [], category: 'Backend', related_skills: ['java', 'maven', 'gradle'] },
  { id: 'csharp', name: 'C#', other_names: ['csharp'], category: 'Backend', related_skills: ['dotnet'] },
  { id: 'dotnet', name: '.NET', other_names: ['dotnet'], category: 'Backend', related_skills: ['csharp'] },
  { id: 'php', name: 'PHP', other_names: [], category: 'Backend', related_skills: ['laravel', 'wordpress'] },
  { id: 'laravel', name: 'Laravel', other_names: [], category: 'Backend', related_skills: ['php', 'mysql'] },
  { id: 'ruby', name: 'Ruby', other_names: [], category: 'Backend', related_skills: ['ruby_on_rails'] },
  { id: 'ruby_on_rails', name: 'Ruby on Rails', other_names: ['Rails'], category: 'Backend', related_skills: ['ruby'] },

  // Databases
  { id: 'sql', name: 'SQL', other_names: [], category: 'Database', related_skills: ['postgresql', 'mysql', 'sql_server'] },
  { id: 'postgresql', name: 'PostgreSQL', other_names: ['Postgres'], category: 'Database', related_skills: ['sql'] },
  { id: 'mysql', name: 'MySQL', other_names: [], category: 'Database', related_skills: ['sql', 'php'] },
  { id: 'mongodb', name: 'MongoDB', other_names: [], category: 'Database', related_skills: ['nodejs', 'nosql'] },
  { id: 'firebase', name: 'Firebase', other_names: [], category: 'Database', related_skills: ['nosql', 'google_cloud'] },
  { id: 'nosql', name: 'NoSQL', other_names: [], category: 'Database', related_skills: ['mongodb', 'firebase', 'cassandra'] },

  // DevOps & Cloud
  { id: 'docker', name: 'Docker', other_names: [], category: 'DevOps & Cloud', related_skills: ['kubernetes', 'ci_cd', 'aws', 'gcp', 'azure'] },
  { id: 'kubernetes', name: 'Kubernetes', other_names: ['k8s'], category: 'DevOps & Cloud', related_skills: ['docker', 'ci_cd', 'aws', 'gcp', 'azure'] },
  { id: 'aws', name: 'AWS', other_names: ['Amazon Web Services'], category: 'DevOps & Cloud', related_skills: ['docker', 'kubernetes', 'gcp', 'azure'] },
  { id: 'gcp', name: 'Google Cloud', other_names: ['GCP'], category: 'DevOps & Cloud', related_skills: ['docker', 'kubernetes', 'aws', 'azure'] },
  { id: 'azure', name: 'Azure', other_names: ['Microsoft Azure'], category: 'DevOps & Cloud', related_skills: ['docker', 'kubernetes', 'aws', 'gcp', 'dotnet'] },
  { id: 'ci_cd', name: 'CI/CD', other_names: ['Continuous Integration', 'Continuous Deployment'], category: 'DevOps & Cloud', related_skills: ['jenkins', 'github_actions', 'docker', 'kubernetes'] },
  { id: 'jenkins', name: 'Jenkins', other_names: [], category: 'DevOps & Cloud', related_skills: ['ci_cd', 'docker'] },
  { id: 'github_actions', name: 'GitHub Actions', other_names: [], category: 'DevOps & Cloud', related_skills: ['ci_cd', 'docker'] },
  { id: 'vercel', name: 'Vercel', other_names: [], category: 'DevOps & Cloud', related_skills: ['nextjs', 'react'] },


  // Management
  { id: 'project_management', name: 'Project Management', other_names: [], category: 'Management', related_skills: ['agile', 'scrum', 'jira'] },
  { id: 'agile', name: 'Agile', other_names: [], category: 'Management', related_skills: ['scrum', 'project_management'] },
  { id: 'scrum', name: 'Scrum', other_names: [], category: 'Management', related_skills: ['agile', 'project_management'] },
  { id: 'jira', name: 'Jira', other_names: [], category: 'Management', related_skills: ['agile', 'scrum'] },

  // Design
  { id: 'ui_ux_design', name: 'UI/UX Design', other_names: [], category: 'Design', related_skills: ['figma', 'adobe_xd'] },
  { id: 'figma', name: 'Figma', other_names: [], category: 'Design', related_skills: ['ui_ux_design'] },
  { id: 'adobe_xd', name: 'Adobe XD', other_names: [], category: 'Design', related_skills: ['ui_ux_design'] },
  
  // Data Science
  { id: 'data_analysis', name: 'Data Analysis', other_names: [], category: 'Data Science', related_skills: ['python', 'sql', 'pandas', 'machine_learning'] },
  { id: 'machine_learning', name: 'Machine Learning', other_names: ['ML'], category: 'Data Science', related_skills: ['python', 'tensorflow', 'pytorch', 'data_analysis'] },
  { id: 'pandas', name: 'Pandas', other_names: [], category: 'Data Science', related_skills: ['python', 'data_analysis'] },
  { id: 'tensorflow', name: 'TensorFlow', other_names: [], category: 'Data Science', related_skills: ['python', 'machine_learning', 'pytorch'] },
  { id: 'pytorch', name: 'PyTorch', other_names: [], category: 'Data Science', related_skills: ['python', 'machine_learning', 'tensorflow'] },

  // Soft Skills
  { id: 'communication', name: 'Communication', other_names: [], category: 'Soft Skills', related_skills: ['teamwork', 'leadership'] },
  { id: 'teamwork', name: 'Teamwork', other_names: [], category: 'Soft Skills', related_skills: ['communication', 'leadership'] },
  { id: 'leadership', name: 'Leadership', other_names: [], category: 'Soft Skills', related_skills: ['communication', 'teamwork', 'project_management'] },
  { id: 'problem_solving', name: 'Problem Solving', other_names: [], category: 'Soft Skills', related_skills: ['communication'] },

  // Human Resources
  { id: 'recruiting', name: 'Recruiting', other_names: [], category: 'Human Resources', related_skills: ['sourcing', 'interviewing', 'onboarding'] },
  { id: 'sourcing', name: 'Sourcing', other_names: [], category: 'Human Resources', related_skills: ['recruiting', 'boolean_search'] },
  { id: 'interviewing', name: 'Interviewing', other_names: [], category: 'Human Resources', related_skills: ['recruiting', 'communication'] },
  { id: 'onboarding', name: 'Onboarding', other_names: [], category: 'Human Resources', related_skills: ['recruiting', 'employee_relations'] },
  { id: 'employee_relations', name: 'Employee Relations', other_names: [], category: 'Human Resources', related_skills: ['onboarding', 'communication'] },
  { id: 'hris', name: 'HRIS', other_names: ['Human Resources Information System'], category: 'Human Resources', related_skills: [] },
  { id: 'boolean_search', name: 'Boolean Search', other_names: [], category: 'Human Resources', related_skills: ['sourcing'] },

  // Sales
  { id: 'lead_generation', name: 'Lead Generation', other_names: [], category: 'Sales', related_skills: ['crm', 'prospecting'] },
  { id: 'crm', name: 'CRM', other_names: ['Customer Relationship Management'], category: 'Sales', related_skills: ['salesforce', 'lead_generation'] },
  { id: 'salesforce', name: 'Salesforce', other_names: [], category: 'Sales', related_skills: ['crm'] },
  { id: 'negotiation', name: 'Negotiation', other_names: [], category: 'Sales', related_skills: ['closing', 'communication'] },
  { id: 'closing', name: 'Closing', other_names: [], category: 'Sales', related_skills: ['negotiation'] },
  { id: 'prospecting', name: 'Prospecting', other_names: [], category: 'Sales', related_skills: ['lead_generation'] },

  // Marketing
  { id: 'seo', name: 'SEO', other_names: ['Search Engine Optimization'], category: 'Marketing', related_skills: ['content_marketing', 'google_analytics'] },
  { id: 'content_marketing', name: 'Content Marketing', other_names: [], category: 'Marketing', related_skills: ['seo', 'social_media_marketing'] },
  { id: 'social_media_marketing', name: 'Social Media Marketing', other_names: [], category: 'Marketing', related_skills: ['content_marketing'] },
  { id: 'google_analytics', name: 'Google Analytics', other_names: [], category: 'Marketing', related_skills: ['seo'] },
];
