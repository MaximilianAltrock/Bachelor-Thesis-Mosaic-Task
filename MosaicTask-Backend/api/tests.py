from datetime import timedelta

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from api.models import Board, JournalEntry, List, Task

User = get_user_model()


class BaseTestCase(APITestCase):

    def setUp(self):
        JournalEntry.objects.all().delete()
        Task.objects.all().delete()
        List.objects.all().delete()
        Board.objects.all().delete()
        User.objects.all().delete()

        self.user = User.objects.create_user(username='testuser',
                                             password='testpass123')
        self.client.force_authenticate(user=self.user)
        self.board = Board.objects.create(name="Test Board")
        self.board.members.add(self.user)
        self.list = List.objects.create(name="Test List", board=self.board)
        self.task = Task.objects.create(title="Test Task",
                                        description="Test Description",
                                        due_date=timezone.now() +
                                        timedelta(days=1),
                                        priority=2,
                                        complexity=2,
                                        list=self.list)
        self.task.assigned_to.add(self.user)
        self.journal_entry = JournalEntry.objects.create(
            user=self.user,
            title="Test Entry",
            content="Test Content",
            task=self.task,
            valence=0.5,
            arousal=0.5)

    def tearDown(self):
        JournalEntry.objects.all().delete()
        Task.objects.all().delete()
        List.objects.all().delete()
        Board.objects.all().delete()
        User.objects.all().delete()


class UserAuthenticationTests(TestCase):

    def test_user_registration(self):
        url = reverse('register')
        data = {'username': 'newuser', 'password': 'newpass123'}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username='newuser').exists())

    def test_user_login(self):
        User.objects.create_user(username='testuser', password='testpass123')
        url = reverse('login')
        data = {'username': 'testuser', 'password': 'testpass123'}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_invalid_login(self):
        url = reverse('login')
        data = {'username': 'nonexistent', 'password': 'wrongpass'}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class BoardTests(BaseTestCase):

    def test_create_board(self):
        url = reverse('board-list')
        data = {'name': 'New Board'}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Board.objects.filter(name='New Board').exists())

    def test_list_boards(self):
        url = reverse('board-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), Board.objects.count())

    def test_retrieve_board(self):
        url = reverse('board-detail', args=[self.board.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Test Board')

    def test_update_board(self):
        url = reverse('board-detail', args=[self.board.id])
        data = {'name': 'Updated Board'}
        response = self.client.patch(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.board.refresh_from_db()
        self.assertEqual(self.board.name, 'Updated Board')

    def test_delete_board(self):
        url = reverse('board-detail', args=[self.board.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Board.objects.filter(id=self.board.id).exists())

    def test_add_member_to_board(self):
        new_user = User.objects.create_user(username='newmember',
                                            password='pass123')
        url = reverse('board-add-member', args=[self.board.id])
        data = {'username': 'newmember'}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn(new_user, self.board.members.all())


class ListTests(BaseTestCase):

    def test_create_list(self):
        url = reverse('list-list')
        data = {'name': 'New List', 'board': self.board.id}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            List.objects.filter(name='New List', board=self.board).exists())

    def test_list_lists(self):
        url = reverse('list-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), List.objects.count())

    def test_retrieve_list(self):
        url = reverse('list-detail', args=[self.list.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Test List')

    def test_update_list(self):
        url = reverse('list-detail', args=[self.list.id])
        data = {'name': 'Updated List'}
        response = self.client.patch(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.list.refresh_from_db()
        self.assertEqual(self.list.name, 'Updated List')

    def test_delete_list(self):
        url = reverse('list-detail', args=[self.list.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(List.objects.filter(id=self.list.id).exists())

    def test_move_list(self):
        url = reverse('list-move', args=[self.list.id])
        data = {'position': 1}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.list.refresh_from_db()
        self.assertEqual(self.list.position, 1)


class TaskTests(BaseTestCase):

    def test_create_task(self):
        url = reverse('task-list')
        data = {
            'title': 'New Task',
            'description': 'New Description',
            'due_date': (timezone.now() + timedelta(days=1)).isoformat(),
            'priority': 1,
            'complexity': 1,
            'list': self.list.id,
            'assigned_to_ids': [self.user.id]
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Task.objects.filter(title='New Task').exists())

    def test_list_tasks(self):
        url = reverse('task-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), Task.objects.count())

    def test_retrieve_task(self):
        url = reverse('task-detail', args=[self.task.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Test Task')

    def test_update_task(self):
        url = reverse('task-detail', args=[self.task.id])
        data = {'title': 'Updated Task'}
        response = self.client.patch(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.task.refresh_from_db()
        self.assertEqual(self.task.title, 'Updated Task')

    def test_delete_task(self):
        url = reverse('task-detail', args=[self.task.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Task.objects.filter(id=self.task.id).exists())

    def test_move_task(self):
        new_list = List.objects.create(name="New List", board=self.board)
        url = reverse('task-move', args=[self.task.id])
        data = {'position': 1, 'list_id': new_list.id}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.task.refresh_from_db()
        self.assertEqual(self.task.list, new_list)
        self.assertEqual(self.task.position, 1)

    def test_assign_task(self):
        url = reverse('task-assign', args=[self.task.id])
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn(self.user, self.task.assigned_to.all())


class JournalEntryTests(BaseTestCase):

    def test_create_journal_entry(self):
        url = reverse('journalentry-list')
        data = {
            'title': 'New Entry',
            'content': 'New Content',
            'task_id': self.task.id,
            'valence': 0.7,
            'arousal': 0.3,
            'visibility': 'private'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            JournalEntry.objects.filter(title='New Entry').exists())

    def test_list_journal_entries(self):
        url = reverse('journalentry-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), JournalEntry.objects.count())

    def test_retrieve_journal_entry(self):
        url = reverse('journalentry-detail', args=[self.journal_entry.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Test Entry')

    def test_update_journal_entry(self):
        url = reverse('journalentry-detail', args=[self.journal_entry.id])
        data = {
            'title': 'Updated Entry',
            'content': 'Updated Content',
            'valence': 0.8,
            'arousal': 0.2,
            'visibility': 'shared'
        }
        response = self.client.patch(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.journal_entry.refresh_from_db()
        self.assertEqual(self.journal_entry.title, 'Updated Entry')
        self.assertEqual(self.journal_entry.visibility, 'shared')

    def test_delete_journal_entry(self):
        url = reverse('journalentry-detail', args=[self.journal_entry.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(
            JournalEntry.objects.filter(id=self.journal_entry.id).exists())

    def test_mood_statistics(self):
        url = reverse('journalentry-mood-statistics')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(len(response.data) > 0)

    def test_heatmap_data(self):
        url = reverse('journalentry-heatmap-data')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(isinstance(response.data, list))

    def test_task_mood_statistics(self):
        url = reverse('journalentry-task-mood-statistics', args=[self.task.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(isinstance(response.data, list))

    def test_task_mood_history(self):
        url = reverse('journalentry-task-mood-history', args=[self.task.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(isinstance(response.data, list))

    def test_project_overview(self):
        url = reverse('journalentry-project-overview', args=[self.board.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(isinstance(response.data, list))

    def test_available_tasks(self):
        url = reverse('journalentry-available-tasks')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(isinstance(response.data, list))

    def test_shareable_users(self):
        url = reverse('journalentry-shareable-users')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(isinstance(response.data, list))


class EdgeCasesAndErrorTests(BaseTestCase):

    def test_create_board_without_authentication(self):
        self.client.force_authenticate(user=None)
        url = reverse('board-list')
        data = {'name': 'Unauthorized Board'}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_add_nonexistent_member_to_board(self):
        url = reverse('board-add-member', args=[self.board.id])
        data = {'username': 'nonexistentuser'}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_create_task_with_invalid_data(self):
        url = reverse('task-list')
        data = {
            'title': '',  # Empty title
            'due_date': 'invalid-date',
            'priority': 5,  # Invalid priority
            'list': self.list.id
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_journal_entry_with_mismatched_mood_data(self):
        url = reverse('journalentry-list')
        data = {
            'title': 'Mismatched Entry',
            'content': 'Content',
            'task_id': self.task.id,
            'valence': 0.7,
            # Missing arousal
            'visibility': 'private'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_access_other_users_private_journal_entry(self):
        other_user = User.objects.create_user(username='otheruser',
                                              password='pass123')
        other_entry = JournalEntry.objects.create(user=other_user,
                                                  title="Private Entry",
                                                  content="Private Content",
                                                  visibility='private')
        url = reverse('journalentry-detail', args=[other_entry.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_move_task_to_nonexistent_list(self):
        url = reverse('task-move', args=[self.task.id])
        data = {'position': 1, 'list_id': 9999}  # Non-existent list ID
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_task_with_past_due_date(self):
        url = reverse('task-list')
        data = {
            'title': 'Past Due Task',
            'description': 'This task is already overdue',
            'due_date': (timezone.now() - timedelta(days=1)).isoformat(),
            'priority': 1,
            'complexity': 1,
            'list': self.list.id,
            'assigned_to_ids': [self.user.id]
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        task = Task.objects.get(title='Past Due Task')
        self.assertTrue(task.is_overdue())

    def test_update_task_assigned_to_nonexistent_user(self):
        url = reverse('task-detail', args=[self.task.id])
        data = {'assigned_to_ids': [9999]}  # Non-existent user ID
        response = self.client.patch(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_journal_entry_with_invalid_visibility(self):
        url = reverse('journalentry-list')
        data = {
            'title': 'Invalid Visibility Entry',
            'content': 'Content',
            'valence': 0.5,
            'arousal': 0.5,
            'visibility': 'invalid'  # Invalid visibility option
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class PerformanceTests(BaseTestCase):

    def test_large_number_of_tasks(self):
        url = reverse('task-list')
        initial_task_count = Task.objects.count()

        for i in range(100):
            data = {
                'title': f'Task {i}',
                'description': f'Description {i}',
                'due_date': (timezone.now() + timedelta(days=1)).isoformat(),
                'priority': 1,
                'complexity': 1,
                'list': self.list.id,
                'assigned_to_ids': [self.user.id]
            }
            response = self.client.post(url, data)
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), initial_task_count + 100)

    def test_board_with_many_lists_and_tasks(self):
        for i in range(20):
            list = List.objects.create(name=f"List {i}", board=self.board)
            for j in range(50):
                Task.objects.create(
                    title=f"Task {j} in List {i}",
                    description=f"Description of Task {j} in List {i}",
                    due_date=timezone.now() + timedelta(days=1),
                    priority=1,
                    complexity=1,
                    list=list)

        url = reverse('board-detail', args=[self.board.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['lists']),
                         21)  # 20 new lists + 1 initial list
        self.assertEqual(
            sum(len(list['tasks']) for list in response.data['lists']),
            1001)  # 1000 new tasks + 1 initial task

    def test_journal_entries_mood_statistics_performance(self):
        # Create 1000 journal entries
        for i in range(1000):
            JournalEntry.objects.create(user=self.user,
                                        title=f"Entry {i}",
                                        content=f"Content {i}",
                                        valence=0.5,
                                        arousal=0.5,
                                        created_at=timezone.now() -
                                        timedelta(days=i % 30))

        url = reverse('journalentry-mood-statistics')
        start_time = timezone.now()
        response = self.client.get(url)
        end_time = timezone.now()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(len(response.data) > 0)

        # Check if the request was processed in less than 5 seconds
        self.assertTrue((end_time - start_time).total_seconds() < 5)

    def test_heatmap_data_performance(self):
        # Create 1000 tasks with varying complexity and priority
        for i in range(1000):
            task = Task.objects.create(title=f"Task {i}",
                                       description=f"Description {i}",
                                       due_date=timezone.now() +
                                       timedelta(days=1),
                                       priority=(i % 3) + 1,
                                       complexity=(i % 3) + 1,
                                       list=self.list)
            JournalEntry.objects.create(user=self.user,
                                        title=f"Entry for Task {i}",
                                        content=f"Content for Task {i}",
                                        task=task,
                                        valence=0.5,
                                        arousal=0.5)

        url = reverse('journalentry-heatmap-data')
        start_time = timezone.now()
        response = self.client.get(url)
        end_time = timezone.now()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(len(response.data) > 0)

        # Check if the request was processed in less than 5 seconds
        self.assertTrue((end_time - start_time).total_seconds() < 5)


class APIIntegrationTests(BaseTestCase):

    def test_create_board_list_task_journal_entry_flow(self):
        # Create a new board
        board_url = reverse('board-list')
        board_data = {'name': 'Integration Test Board'}
        board_response = self.client.post(board_url, board_data)
        self.assertEqual(board_response.status_code, status.HTTP_201_CREATED)
        board_id = board_response.data['id']

        # Create a new list in the board
        list_url = reverse('list-list')
        list_data = {'name': 'Integration Test List', 'board': board_id}
        list_response = self.client.post(list_url, list_data)
        self.assertEqual(list_response.status_code, status.HTTP_201_CREATED)
        list_id = list_response.data['id']

        # Create a new task in the list
        task_url = reverse('task-list')
        task_data = {
            'title': 'Integration Test Task',
            'description': 'This is a test task for API integration',
            'due_date': (timezone.now() + timedelta(days=1)).isoformat(),
            'priority': 2,
            'complexity': 2,
            'list': list_id,
            'assigned_to_ids': [self.user.id]
        }
        task_response = self.client.post(task_url, task_data)
        self.assertEqual(task_response.status_code, status.HTTP_201_CREATED)
        task_id = task_response.data['id']

        # Create a journal entry for the task
        journal_url = reverse('journalentry-list')
        journal_data = {
            'title': 'Integration Test Journal Entry',
            'content': 'This is a test journal entry for API integration',
            'task_id': task_id,
            'valence': 0.7,
            'arousal': 0.3,
            'visibility': 'private'
        }
        journal_response = self.client.post(journal_url, journal_data)
        self.assertEqual(journal_response.status_code, status.HTTP_201_CREATED)

        # Verify the entire flow
        board_detail_url = reverse('board-detail', args=[board_id])
        board_response = self.client.get(board_detail_url)
        self.assertEqual(board_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(board_response.data['lists']), 1)
        self.assertEqual(len(board_response.data['lists'][0]['tasks']), 1)
        self.assertEqual(board_response.data['lists'][0]['tasks'][0]['title'],
                         'Integration Test Task')

        task_detail_url = reverse('task-detail', args=[task_id])
        task_response = self.client.get(task_detail_url)
        self.assertEqual(task_response.status_code, status.HTTP_200_OK)
        self.assertEqual(task_response.data['title'], 'Integration Test Task')

        journal_list_url = reverse('journalentry-list')
        journal_response = self.client.get(journal_list_url)
        self.assertEqual(journal_response.status_code, status.HTTP_200_OK)
        self.assertTrue(
            any(entry['title'] == 'Integration Test Journal Entry'
                for entry in journal_response.data))


if __name__ == '__main__':
    import unittest
    unittest.main()
