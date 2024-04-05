import React, { useEffect, useState } from 'react';
import { Card, ListGroup, Button, Collapse } from 'react-bootstrap';
import { get, del } from '../api/api';

function ListOfGroup() {
  const [groups, setGroups] = useState([]);
  const [collapseOpen, setCollapseOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await get('/groupList');
        setGroups(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    fetchData();
  }, []);

  const handleDelete = async (event) => {
    try {
      const groupNameToDelete = event.target.value;
      // Delete the group with the given name
      await del(`/deleteGroup?nameGroup=${groupNameToDelete}`);
      console.log('Group deleted:', groupNameToDelete);

      // Update the list of groups after deletion
      const response = await get('/groupList');
      setGroups(response.data);
    } catch (error) {
      console.error('Error deleting group:', error);
    }
  };

  const toggleCollapse = () => {
    setCollapseOpen(!collapseOpen);
  };

  return (
    <>
      <Card>
        <Card.Header
          onClick={toggleCollapse}
          style={{
            cursor: 'pointer',
            transition: 'background-color 0.3s ease-in-out',
            backgroundColor: collapseOpen ? '#dc3545' : '#007bff',
            color: 'white',
          }}
        >
          {collapseOpen ? 'Hide Group List' : 'Show Group List'}
        </Card.Header>

        <Collapse in={collapseOpen} style={{ transition: 'height 0.3s ease-in-out' }}>
          <Card.Body>
            <ListGroup>
              {groups.map((group, index) => (
                <ListGroup.Item key={index} className="d-flex justify-content-between">
                  <div>
                    <div>
                      <strong>Name:</strong> {group.nameGroup}
                    </div>
                    <div>
                      <strong>Pattern:</strong> {group.pattern}
                    </div>
                  </div>
                  <Button
                    variant="danger"
                    value={group.nameGroup}
                    onClick={handleDelete}
                  >
                    Delete
                  </Button>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card.Body>
        </Collapse>
      </Card>
    </>
  );
}

export default ListOfGroup;
