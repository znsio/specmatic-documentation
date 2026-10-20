import React from 'react';
import Link from '@docusaurus/Link';
import tasks from '../../data/configuration/tasks.json';
import styles from './styles.module.css';
export default function ConfigurationTasks() {
  return <div className={styles.grid}>{tasks.map(task=><Link className={styles.task} to={task.href} key={task.title}><span className={styles.title}>{task.title}<span aria-hidden="true"> →</span></span><span className={styles.description}>{task.description}</span><span className={styles.availability}>{task.availability}</span></Link>)}</div>;
}
