import { writable, derived } from 'svelte/store';

type TaskList = Set<string>;

const taskListStore = writable<TaskList>(new Set());

export const loadStore = derived(taskListStore, ($taskList) => $taskList);

export const taskCount = derived(taskListStore, ($taskList) => $taskList.size);

export function addTask(task: string) {
	// console.log(`Adding task: ${task}`);
	taskListStore.update((tasks) => {
		const newTasks = new Set(tasks);
		newTasks.add(task);
		// console.log(`Current tasks after add: ${Array.from(newTasks).join(', ')}`);
		return newTasks;
	});
}

export function removeTask(task: string) {
	// console.log(`Removing task: ${task}`);
	taskListStore.update((tasks) => {
		const newTasks = new Set(tasks);
		newTasks.delete(task);
		// console.log(`Current tasks after remove: ${Array.from(newTasks).join(', ')}`);
		return newTasks;
	});
}
export function removeAllTasks() {
	// console.log('Removing all tasks');
	taskListStore.update(() => new Set());
}

export function getTaskCount(): number {
	let count = 0;
	taskListStore.subscribe((tasks) => {
		count = tasks.size;
	})();
	return count;
}

export function isLoading(): boolean {
	return getTaskCount() > 0;
}
