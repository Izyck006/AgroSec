"""Unit tests for edge_detector module.

The module has heavy module-level side effects (model loading, DB init,
camera capture, daemon threads) so we patch those before importing the
testable functions.
"""

import importlib
import sqlite3
import sys
import types
import unittest
from unittest.mock import MagicMock, patch, call


# ---------------------------------------------------------------------------
# Helpers to set up a safe import environment
# ---------------------------------------------------------------------------

def _import_edge_detector():
    """Import edge_detector with all heavy side-effects stubbed out."""
    # Create stub modules that are not available in the test environment
    winsound_stub = types.ModuleType("winsound")
    winsound_stub.PlaySound = MagicMock()
    winsound_stub.SND_FILENAME = 0x00020000
    winsound_stub.SND_NODEFAULT = 0x00000002
    sys.modules["winsound"] = winsound_stub

    cv2_stub = types.ModuleType("cv2")
    dnn_stub = MagicMock()
    net_mock = MagicMock()
    dnn_stub.readNetFromCaffe = MagicMock(return_value=net_mock)
    dnn_stub.blobFromImage = MagicMock()
    cv2_stub.dnn = dnn_stub
    cv2_stub.VideoCapture = MagicMock()
    cv2_stub.resize = MagicMock(return_value=MagicMock())
    cv2_stub.imencode = MagicMock(return_value=(True, b"\xff\xd8fake"))
    cv2_stub.imshow = MagicMock()
    cv2_stub.waitKey = MagicMock(return_value=ord("q"))
    cv2_stub.destroyAllWindows = MagicMock()
    cv2_stub.COLOR_BGR2RGB = 4
    cv2_stub.FONT_HERSHEY_DUPLEX = 2
    sys.modules["cv2"] = cv2_stub

    face_recognition_stub = types.ModuleType("face_recognition")
    face_recognition_stub.face_encodings = MagicMock(return_value=[[0.1]])
    face_recognition_stub.compare_faces = MagicMock(return_value=[True])
    sys.modules["face_recognition"] = face_recognition_stub

    # Remove cached module so we get a fresh import
    sys.modules.pop("edge_detector", None)

    with patch("sqlite3.connect") as mock_conn, \
         patch("threading.Thread") as mock_thread:
        mock_cursor = MagicMock()
        mock_conn.return_value.cursor.return_value = mock_cursor
        mock_thread_instance = MagicMock()
        mock_thread.return_value = mock_thread_instance

        # The module's top-level code will try to open a VideoCapture and
        # enter the main while-loop.  We patch VideoCapture.read to
        # immediately return (False, None) so the loop breaks.
        cap_mock = MagicMock()
        cap_mock.read.return_value = (False, None)
        cv2_stub.VideoCapture.return_value = cap_mock

        mod = importlib.import_module("edge_detector")

    return mod


# ---------------------------------------------------------------------------
# Test cases
# ---------------------------------------------------------------------------

class TestInitLocalDb(unittest.TestCase):
    """Tests for init_local_db()."""

    def test_creates_table(self):
        """init_local_db should create the alerts_cache table."""
        with patch("sqlite3.connect") as mock_connect:
            mock_cursor = MagicMock()
            mock_connect.return_value.cursor.return_value = mock_cursor

            mod = _import_edge_detector()
            # Call it again explicitly to assert on our fresh mock
            mock_connect.reset_mock()
            mod.init_local_db()

            mock_connect.assert_called_once_with(mod.DB_FILENAME)
            create_sql = mock_cursor.execute.call_args[0][0]
            self.assertIn("CREATE TABLE IF NOT EXISTS alerts_cache", create_sql)
            mock_connect.return_value.commit.assert_called_once()
            mock_connect.return_value.close.assert_called_once()

    def test_handles_db_error(self, ):
        """init_local_db should not raise on database errors."""
        with patch("sqlite3.connect", side_effect=sqlite3.OperationalError("disk I/O error")):
            mod = _import_edge_detector()
            # Should not raise
            mod.init_local_db()


class TestSaveAlertToBackup(unittest.TestCase):
    """Tests for save_alert_to_backup()."""

    def setUp(self):
        self.mod = _import_edge_detector()
        self.sample_payload = {
            "intruderType": "person",
            "confidence": 92.5,
            "imageData": "base64data==",
            "timestamp": "2026-06-18T12:00:00",
        }

    def test_inserts_alert_into_cache(self):
        with patch("sqlite3.connect") as mock_connect:
            mock_cursor = MagicMock()
            mock_connect.return_value.cursor.return_value = mock_cursor

            self.mod.save_alert_to_backup(self.sample_payload)

            insert_sql = mock_cursor.execute.call_args[0][0]
            self.assertIn("INSERT INTO alerts_cache", insert_sql)
            values = mock_cursor.execute.call_args[0][1]
            self.assertEqual(values[0], "person")
            self.assertAlmostEqual(values[1], 92.5)
            self.assertEqual(values[2], "base64data==")
            mock_connect.return_value.commit.assert_called_once()
            mock_connect.return_value.close.assert_called_once()

    def test_handles_insert_error(self):
        with patch("sqlite3.connect", side_effect=sqlite3.OperationalError("table locked")):
            # Should not raise
            self.mod.save_alert_to_backup(self.sample_payload)


class TestHandleDetection(unittest.TestCase):
    """Tests for handle_detection()."""

    def setUp(self):
        self.mod = _import_edge_detector()
        import numpy as np
        self.fake_frame = np.zeros((240, 320, 3), dtype="uint8")

    @patch("requests.post")
    def test_person_detection_sends_alert(self, mock_post):
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_post.return_value = mock_response

        import cv2
        cv2.resize = MagicMock(return_value=self.fake_frame)
        cv2.imencode = MagicMock(return_value=(True, b"\xff\xd8fake"))

        self.mod.handle_detection("person", 0.95, self.fake_frame)

        mock_post.assert_called_once()
        payload = mock_post.call_args[1]["json"]
        self.assertEqual(payload["intruderType"], "person")
        self.assertAlmostEqual(payload["confidence"], 95.0)
        self.assertEqual(payload["status"], "Dog Bark")

    @patch("requests.post")
    def test_cow_detection_sends_alert(self, mock_post):
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_post.return_value = mock_response

        import cv2
        cv2.resize = MagicMock(return_value=self.fake_frame)
        cv2.imencode = MagicMock(return_value=(True, b"\xff\xd8fake"))

        self.mod.handle_detection("cow", 0.90, self.fake_frame)

        payload = mock_post.call_args[1]["json"]
        self.assertEqual(payload["intruderType"], "cow")
        self.assertAlmostEqual(payload["confidence"], 90.0)
        self.assertEqual(payload["status"], "Hyena Audio")

    @patch("requests.post")
    def test_sheep_detection_sends_alert(self, mock_post):
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_post.return_value = mock_response

        import cv2
        cv2.resize = MagicMock(return_value=self.fake_frame)
        cv2.imencode = MagicMock(return_value=(True, b"\xff\xd8fake"))

        self.mod.handle_detection("sheep", 0.88, self.fake_frame)

        payload = mock_post.call_args[1]["json"]
        self.assertEqual(payload["intruderType"], "sheep")
        self.assertEqual(payload["status"], "Hyena Audio")

    @patch("requests.post", side_effect=Exception("Connection refused"))
    def test_backend_failure_saves_to_backup(self, mock_post):
        import cv2
        cv2.resize = MagicMock(return_value=self.fake_frame)
        cv2.imencode = MagicMock(return_value=(True, b"\xff\xd8fake"))

        import requests
        mock_post.side_effect = requests.exceptions.RequestException("Connection refused")

        with patch.object(self.mod, "save_alert_to_backup") as mock_backup:
            self.mod.handle_detection("person", 0.95, self.fake_frame)
            mock_backup.assert_called_once()

    @patch("requests.post")
    def test_backend_timeout_saves_to_backup(self, mock_post):
        import cv2
        cv2.resize = MagicMock(return_value=self.fake_frame)
        cv2.imencode = MagicMock(return_value=(True, b"\xff\xd8fake"))

        import requests
        mock_post.side_effect = requests.exceptions.Timeout("timed out")

        with patch.object(self.mod, "save_alert_to_backup") as mock_backup:
            self.mod.handle_detection("cow", 0.91, self.fake_frame)
            mock_backup.assert_called_once()

    @patch("requests.post")
    def test_backend_non_200_saves_to_backup(self, mock_post):
        mock_response = MagicMock()
        mock_response.status_code = 500
        mock_post.return_value = mock_response

        import cv2
        cv2.resize = MagicMock(return_value=self.fake_frame)
        cv2.imencode = MagicMock(return_value=(True, b"\xff\xd8fake"))

        with patch.object(self.mod, "save_alert_to_backup") as mock_backup:
            self.mod.handle_detection("person", 0.95, self.fake_frame)
            mock_backup.assert_called_once()


class TestModuleConstants(unittest.TestCase):
    """Tests for module-level constants and configuration."""

    def setUp(self):
        self.mod = _import_edge_detector()

    def test_primary_api_url(self):
        self.assertEqual(self.mod.PRIMARY_API_URL, "http://localhost:8080/api/alerts")

    def test_confidence_threshold(self):
        self.assertEqual(self.mod.CONFIDENCE_THRESHOLD, 0.85)

    def test_target_classes(self):
        self.assertIn("person", self.mod.TARGET_CLASSES)
        self.assertIn("cow", self.mod.TARGET_CLASSES)
        self.assertIn("sheep", self.mod.TARGET_CLASSES)

    def test_classes_list_length(self):
        self.assertEqual(len(self.mod.CLASSES), 21)

    def test_db_filename(self):
        self.assertEqual(self.mod.DB_FILENAME, "agrosec_cache.db")


if __name__ == "__main__":
    unittest.main()
