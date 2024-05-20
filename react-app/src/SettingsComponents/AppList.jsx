import React, { useEffect, useState } from 'react';
import { Card, ListGroup, Button, Collapse } from 'react-bootstrap';
import { get, del } from '../api/api';

function AppList() {
  const [groups, setGroups] = useState([]);
  const [collapseOpen, setCollapseOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await get('/unproductiveList');
        setGroups(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    fetchData();
  }, []);

  const handleDelete = async (event) => {
    try {
      const groupNameToDelete = event.target.value; // Use the "name" as the identifier
      // Delete the group with the given name
      await del(`/deleteapp?name=${groupNameToDelete}`);
      console.log('Group deleted:', groupNameToDelete);

      // Update the list of groups after deletion
      const response = await get('/unproductiveList');
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
        <Card.Header className='show-list'
          onClick={toggleCollapse}
          style={{
            cursor: 'pointer',
            transition: 'background-color 0.3s ease-in-out',
            backgroundColor: collapseOpen ? '#f6f9ff' : '#fff',
            color: '#012970',
          }}
        >
          {collapseOpen ? 'Hide Unproductive List' : 'Show Unproductive List'}
        </Card.Header>

        <Collapse in={collapseOpen} style={{ transition: 'height 0.3s ease-in-out' }}>
          <Card.Body>
            <ListGroup className='listgroup'>
              {groups.map((group, index) => (
                <ListGroup.Item key={index} className="d-flex justify-content-between">
                  <div>
                    <div>
                      <strong>Name:</strong> {group.name}
                    </div>
                    <div>
                      <strong>Pattern:</strong> {group.pattern}
                    </div>
                  </div>
                  <Button
                    variant="primary"
                    value={group.name} // Use the "name" as the identifier
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

export default AppList;
