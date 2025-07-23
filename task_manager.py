class TaskManager:
    def __init__(self):
        self.tasks = []
        self.next_id = 1
    
    def add_task(self, title, description="", priority="medium"):
        """Add a new task to the task manager"""
        task = {
            "id": self.next_id,
            "title": title,
            "description": description,
            "priority": priority,
            "completed": False
        }
        self.tasks.append(task)
        self.next_id += 1
        return task
    
    def delete_task(self, task_id):
        """Delete a task by its ID"""
        for i, task in enumerate(self.tasks):
            if task["id"] == task_id:
                deleted_task = self.tasks.pop(i)
                return deleted_task
        return None
    
    def get_all_tasks(self):
        """Get all tasks"""
        return self.tasks
    
    def get_task(self, task_id):
        """Get a specific task by ID"""
        for task in self.tasks:
            if task["id"] == task_id:
                return task
        return None