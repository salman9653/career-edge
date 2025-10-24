
export interface Skill {
  id: string;
  name: string;
  other_names: string[];
  related_skills: string[];
}

export const skillsData: Skill[] = [
  // Frontend
  { id: 'react', name: 'React', other_names: ['React.js', 'ReactJS'], related_skills: ['javascript', 'typescript', 'redux', 'nextjs', 'html5', 'css3'] },
  { id: 'javascript', name: 'JavaScript', other_names: ['js'], related_skills: ['react', 'nodejs', 'typescript', 'html5', 'css3'] },
  { id: 'typescript', name: 'TypeScript', other_names: ['ts'], related_skills: ['react', 'nodejs', 'javascript', 'angular'] },
  { id: 'angular', name: 'Angular', other_names: ['Angular.js'], related_skills: ['typescript', 'javascript'] },
  { id: 'vue', name: 'Vue.js', other_names: ['Vue'], related_skills: ['javascript', 'vuex'] },
  { id: 'nextjs', name: 'Next.js', other_names: [], related_skills: ['react', 'nodejs', 'vercel'] },
  { id: 'redux', name: 'Redux', other_names: [], related_skills: ['react', 'javascript'] },
  { id: 'html5', name: 'HTML5', other_names: ['html'], related_skills: ['css3', 'javascript'] },
  { id: 'css3', name: 'CSS3', other_names: ['css'], related_skills: ['html5', 'sass', 'tailwind'] },
  { id: 'sass', name: 'SASS', other_names: ['scss'], related_skills: ['css3', 'html5'] },
  { id: 'tailwind', name: 'Tailwind CSS', other_names: [], related_skills: ['css3', 'react', 'nextjs'] },
  
  // Backend
  { id: 'nodejs', name: 'Node.js', other_names: ['NodeJS'], related_skills: ['javascript', 'typescript', 'express', 'mongodb', 'rest_apis'] },
  { id: 'express', name: 'Express.js', other_names: ['Express'], related_skills: ['nodejs', 'javascript'] },
  { id: 'python', name: 'Python', other_names: [], related_skills: ['django', 'flask', 'data_analysis', 'machine_learning'] },
  { id: 'django', name: 'Django', other_names: [], related_skills: ['python', 'rest_apis'] },
  { id: 'flask', name: 'Flask', other_names: [], related_skills: ['python'] },
  { id: 'java', name: 'Java', other_names: [], related_skills: ['spring_boot', 'sql'] },
  { id: 'spring_boot', name: 'Spring Boot', other_names: [], related_skills: ['java', 'maven', 'gradle'] },
  { id: 'csharp', name: 'C#', other_names: ['csharp'], related_skills: ['dotnet'] },
  { id: 'dotnet', name: '.NET', other_names: ['dotnet'], related_skills: ['csharp'] },
  { id: 'php', name: 'PHP', other_names: [], related_skills: ['laravel', 'wordpress'] },
  { id: 'laravel', name: 'Laravel', other_names: [], related_skills: ['php', 'mysql'] },
  { id: 'ruby', name: 'Ruby', other_names: [], related_skills: ['ruby_on_rails'] },
  { id: 'ruby_on_rails', name: 'Ruby on Rails', other_names: ['Rails'], related_skills: ['ruby'] },

  // Databases
  { id: 'sql', name: 'SQL', other_names: [], related_skills: ['postgresql', 'mysql', 'sql_server'] },
  { id: 'postgresql', name: 'PostgreSQL', other_names: ['Postgres'], related_skills: ['sql'] },
  { id: 'mysql', name: 'MySQL', other_names: [], related_skills: ['sql', 'php'] },
  { id: 'mongodb', name: 'MongoDB', other_names: [], related_skills: ['nodejs', 'nosql'] },
  { id: 'firebase', name: 'Firebase', other_names: [], related_skills: ['nosql', 'google_cloud'] },
  { id: 'nosql', name: 'NoSQL', other_names: [], related_skills: ['mongodb', 'firebase', 'cassandra'] },

  // DevOps & Cloud
  { id: 'docker', name: 'Docker', other_names: [], related_skills: ['kubernetes', 'ci_cd', 'aws', 'gcp', 'azure'] },
  { id: 'kubernetes', name: 'Kubernetes', other_names: ['k8s'], related_skills: ['docker', 'ci_cd', 'aws', 'gcp', 'azure'] },
  { id: 'aws', name: 'AWS', other_names: ['Amazon Web Services'], related_skills: ['docker', 'kubernetes', 'gcp', 'azure'] },
  { id: 'gcp', name: 'Google Cloud', other_names: ['GCP'], related_skills: ['docker', 'kubernetes', 'aws', 'azure'] },
  { id: 'azure', name: 'Azure', other_names: ['Microsoft Azure'], related_skills: ['docker', 'kubernetes', 'aws', 'gcp', 'dotnet'] },
  { id: 'ci_cd', name: 'CI/CD', other_names: ['Continuous Integration', 'Continuous Deployment'], related_skills: ['jenkins', 'github_actions', 'docker', 'kubernetes'] },
  { id: 'jenkins', name: 'Jenkins', other_names: [], related_skills: ['ci_cd', 'docker'] },
  { id: 'github_actions', name: 'GitHub Actions', other_names: [], related_skills: ['ci_cd', 'docker'] },

  // Other
  { id: 'rest_apis', name: 'REST APIs', other_names: ['RESTful APIs'], related_skills: ['nodejs', 'django', 'spring_boot'] },
  { id: 'graphql', name: 'GraphQL', other_names: [], related_skills: ['apollo', 'react'] },
  { id: 'project_management', name: 'Project Management', other_names: [], related_skills: ['agile', 'scrum', 'jira'] },
  { id: 'agile', name: 'Agile', other_names: [], related_skills: ['scrum', 'project_management'] },
  { id: 'scrum', name: 'Scrum', other_names: [], related_skills: ['agile', 'project_management'] },
  { id: 'jira', name: 'Jira', other_names: [], related_skills: ['agile', 'scrum'] },
  { id: 'ui_ux_design', name: 'UI/UX Design', other_names: [], related_skills: ['figma', 'adobe_xd'] },
  { id: 'figma', name: 'Figma', other_names: [], related_skills: ['ui_ux_design'] },
  { id: 'adobe_xd', name: 'Adobe XD', other_names: [], related_skills: ['ui_ux_design'] },
  { id: 'data_analysis', name: 'Data Analysis', other_names: [], related_skills: ['python', 'sql', 'pandas'] },
  { id: 'machine_learning', name: 'Machine Learning', other_names: ['ML'], related_skills: ['python', 'tensorflow', 'pytorch'] },
];
