import * as React from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Checkbox from "@mui/material/Checkbox";
import { visuallyHidden } from "@mui/utils";
import { Button } from "@mui/material";
import dayjs from "dayjs";
import { styled } from "@mui/material/styles";
import { tableCellClasses } from "@mui/material/TableCell";
import ConfirmationModal from "../ConfirmationModal";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  // Header cells
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: "#4652b7",
    color: theme.palette.common.white,
    fontWeight: 600,
    fontSize: 15,
  },
  // Body cells
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    padding: theme.spacing(1.5),
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
}));

function customComparator(a, b, order, orderBy) {
  const aValue = a[orderBy];
  const bValue = b[orderBy];

  // Always place null last, regardless of ascending or descending.
  if (aValue == null && bValue == null) return 0;
  if (aValue == null) return 1; // a goes to the bottom
  if (bValue == null) return -1; // b goes to the bottom

  // Now compare real values:
  // 1) If both are Day.js objects, compare their timestamps
  if (dayjs.isDayjs(aValue) && dayjs.isDayjs(bValue)) {
    return order === "asc"
      ? aValue.valueOf() - bValue.valueOf()
      : bValue.valueOf() - aValue.valueOf();
  }

  // 2) If both are numbers
  if (typeof aValue === "number" && typeof bValue === "number") {
    return order === "asc" ? aValue - bValue : bValue - aValue;
  }

  // 3) If both are strings
  if (typeof aValue === "string" && typeof bValue === "string") {
    return order === "asc"
      ? aValue.localeCompare(bValue)
      : bValue.localeCompare(aValue);
  }

  // 4) Fallback: Convert to string and compare
  const aStr = String(aValue);
  const bStr = String(bValue);
  return order === "asc" ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
}

function getComparator(order, orderBy) {
  return (a, b) => customComparator(a, b, order, orderBy);
}

// ##########################################################################################################################
const headCells = [
  {
    id: "taskName",
    numeric: false,
    disablePadding: true,
    label: "Name",
  },
  {
    id: "taskType",
    numeric: false,
    disablePadding: false,
    label: "Type",
  },
  {
    id: "semesterName",
    numeric: false,
    disablePadding: false,
    label: "Semester",
  },
  {
    id: "className",
    numeric: false,
    disablePadding: false,
    label: "Class",
  },
  {
    id: "taskStart",
    numeric: false,
    disablePadding: false,
    label: "Start",
  },
  {
    id: "taskEnd",
    numeric: false,
    disablePadding: false,
    label: "End",
  },
  {
    id: "duration",
    numeric: true,
    disablePadding: false,
    label: "Duration",
  },
];

// ###########################################################################################################
function EnhancedTableHead(props) {
  const { order, orderBy, onRequestSort } = props;

  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        <StyledTableCell padding="checkbox" />
        {headCells.map((headCell) => (
          <StyledTableCell
            key={headCell.id}
            align={headCell.id !== "taskName" ? "center" : "left"}
            padding={headCell.disablePadding ? "none" : "normal"}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : "asc"}
              onClick={createSortHandler(headCell.id)}
              sx={{ color: "white", "&.Mui-active": { color: "white" } }} // make sort label white too
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === "desc" ? "sorted descending" : "sorted ascending"}
                </Box>
              ) : null}
            </TableSortLabel>
          </StyledTableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.oneOf(["asc", "desc"]).isRequired,
  orderBy: PropTypes.string.isRequired,
};

// ###########################################################################################################

function EnhancedTableToolbar(props) {
  const { numSelected, handleShow, markComplete } = props;
  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
      }}
    >
      <Typography
        variant="h6"
        id="tableTitle"
        component="div"
        sx={{ fontWeight: "bold" }}
      >
        Upcoming/Unassigned
      </Typography>
      {numSelected > 0 && (
        <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 2 }}>
          <Typography variant="subtitle1" color="inherit">
            {numSelected} selected
          </Typography>
          <Button variant="contained" onClick={markComplete}>
            Complete
          </Button>
          <Button variant="contained" color="error" onClick={handleShow}>
            Delete
          </Button>
        </Box>
      )}
    </Toolbar>
  );
}

EnhancedTableToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired,
  handleShow: PropTypes.func.isRequired,
  markComplete: PropTypes.func.isRequired,
};

// #########################################################################################################

/**
 * UpcomingTable Component
 *
 * Renders a table of upcoming and unassigned tasks with functionalities such as sorting, pagination,
 * selection, marking tasks as complete, and deletion. It utilizes Material UI components to layout the table
 * and includes a confirmation modal for deletion operations.
 *
 * @component
 * @param {Object} props - Component properties.
 * @param {Array<Object>} props.tasks - The list of task objects to be displayed.
 * @param {Function} props.deleteTasks - Callback function to delete the selected tasks.
 * @param {Function} props.markComplete - Callback function to mark the selected tasks as complete.
 *
 * @example
 * const tasks = [
 *   {
 *     taskID: 1,
 *     taskName: "Complete Assignment",
 *     taskType: "homework",
 *     semesterName: "Fall 2023",
 *     className: "Software Engineering",
 *     taskStart: moment(),
 *     taskEnd: moment().add(2, 'hours'),
 *     duration: 120
 *   },
 *   // more tasks...
 * ];
 *
 * <UpcomingTable tasks={tasks} deleteTasks={handleDelete} markComplete={handleMarkComplete} />
 */
export default function UpcomingTable({ tasks, deleteTasks, markComplete }) {
  const [order, setOrder] = React.useState("asc");
  const [orderBy, setOrderBy] = React.useState("taskStart");
  const [selected, setSelected] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
  };

  const handleMarkComplete = () => {
    markComplete(selected);
    setSelected([]);
  };

  const handleShowDeleteModal = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteTasks = () => {
    deleteTasks(selected);
    setShowDeleteModal(false);
    setSelected([]);
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  function capitalizeFirstLetter(string) {
    if (!string) return ""; // Handle null/undefined/empty
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  const handleClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }
    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  React.useEffect(() => {
    console.log("Data: ");
    console.log(tasks);
  }, [tasks]);

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - tasks.length) : 0;

  const visibleRows = React.useMemo(() => {
    return [...tasks]
      .sort(getComparator(order, orderBy))
      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [order, orderBy, page, rowsPerPage, tasks]);

  return (
    <Box sx={{ width: "100%" }}>
      {showDeleteModal && (
        <ConfirmationModal
          open={showDeleteModal}
          handleClose={handleCloseDeleteModal}
          handleFinish={handleDeleteTasks}
          text={`Are you sure you want to delete ${selected.length} task${selected.length > 1 ? "s" : ""}. This action cannot be undone.`}
          title={"Delete Task"}
        />
      )}
      <EnhancedTableToolbar
        numSelected={selected.length}
        handleShow={handleShowDeleteModal}
        markComplete={handleMarkComplete}
      />
      <Paper
        sx={{
          width: "100%",
          borderRadius: 2,
          boxShadow: 3,
          overflow: "hidden",
          ".MuiTablePagination-displayedRows, .MuiTablePagination-selectLabel":
            {
              "margin-top": "1em",
              "margin-bottom": "1em",
            },
        }}
      >
        <TableContainer>
          <Table
            sx={{ minWidth: 750 }}
            aria-labelledby="tableTitle"
            size="medium"
          >
            <EnhancedTableHead
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
              rowCount={tasks.length}
            />
            <TableBody>
              {visibleRows.length > 0 ? (
                visibleRows.map((row, index) => {
                  const isItemSelected = selected.includes(row.taskID);
                  const labelId = `enhanced-table-checkbox-${index}`;
                  return (
                    <TableRow
                      hover
                      onClick={(event) => handleClick(event, row.taskID)}
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={row.taskID}
                      selected={isItemSelected}
                      sx={{
                        borderBottom: "1px solid",
                        borderColor: "grey.200",
                        "&:hover": {
                          backgroundColor: (theme) =>
                            theme.palette.action.hover,
                        },
                        "& td": { py: 1 },
                      }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          color="primary"
                          checked={isItemSelected}
                          inputProps={{
                            "aria-labelledby": labelId,
                          }}
                        />
                      </TableCell>
                      <TableCell
                        component="th"
                        id={labelId}
                        scope="row"
                        padding="none"
                      >
                        {row.taskName}
                      </TableCell>
                      <TableCell align="center">
                        {capitalizeFirstLetter(row.taskType)}
                      </TableCell>
                      <TableCell align="center">
                        {row.semesterName ? row.semesterName : "n/a"}
                      </TableCell>
                      <TableCell align="center">
                        {row.className ? row.className : "n/a"}
                      </TableCell>
                      <TableCell align="center">
                        {row.taskStart
                          ? row.taskStart.format("MM/DD/YY hh:mmA")
                          : "n/a"}
                      </TableCell>
                      <TableCell align="center">
                        {row.taskEnd
                          ? row.taskEnd.format("MM/DD/YY hh:mmA")
                          : "n/a"}
                      </TableCell>
                      <TableCell align="center">{row.duration} min</TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <StyledTableCell
                    align="center"
                    colSpan={headCells.length + 1}
                  >
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: "bold", fontStyle: "italic", p: 6 }}
                    >
                      No upcoming or unassigned tasks.
                    </Typography>
                  </StyledTableCell>
                </TableRow>
              )}
              {emptyRows > 0 && (
                <TableRow style={{ height: 53 * emptyRows }}>
                  <TableCell colSpan={headCells.length + 1} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={tasks.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
}
