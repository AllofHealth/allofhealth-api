// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

contract AllofHealthV3 {
    /**
     * Erorrs
     */
    error Unauthorized();
    error HospitalNotApproved();
    error DoctorNotApproved();
    error OnlyAdminAllowed();
    error OnlyPatientAllowed();
    error OnlySystemAdminAllowed();
    error RecordNotFound();
    error InvalidHospitalId();
    error InvalidDoctorId();
    error InvalidPharmacistId();
    error InvalidPatientId();
    error InvalidMedicalRecordId();
    error InvalidRecordType();
    error InvalidRegNo();
    error DuplicateHospitalRegNo();
    error DuplicateDoctorAddress();
    error DuplicatePharmacistAddress();
    error DuplicatePatientAddress();
    error DuplicatePatientFamilyMember();
    error DuplicateDoctorRegNo();
    error InvalidAddress();
    error DoctorNotFound();
    error DoctorAlreadyRejected();
    error PharmacistNotFound();
    error PharmacistNotApproved();
    error PharmacistAlreadyRejected();
    error NotRecordOwner();
    error AccessToRecordAlreadyGranted();
    error AccessToRecordNotGranted();
    error MedicalRecordNotFound();
    error MedicalRecordAccessRevoked();
    error AccessAlreadyGranted();
    error AccessNotGranted();
    error InvalidMedicalRecordDetail();
    error InvalidFamilyMemberId();
    error InvalidPractitioner();
    error PractitionerNotApproved();

    /**
     * Type Declarations
     */
    enum approvalType {
        Pending,
        Approved,
        Rejected
    }

    struct Hospital {
        uint256 hospitalId;
        uint256 doctorsCount;
        uint256 pharmacistsCount;
        address admin;
        approvalType approvalStatus;
    }

    struct Doctor {
        uint256 doctorId;
        address doctor;
    }

    struct Pharmacist {
        uint256 pharmacistId;
        address pharmacist;
    }

    struct Patient {
        uint256 patientId;
        uint256 patientMedicalRecordCount;
        uint256 patientFamilyMemberCount;
        address walletAddress;
    }

    struct PatientFamilyMember {
        uint256 familyMemberId;
        uint256 principalPatientId;
        uint256 familyMemberMedicalRecordCount;
    }

    struct MedicalRecord {
        uint256 medicalRecordId;
        uint256 patientId;
        uint256 duration;
        uint256 expiration;
        address patient;
        address approvedDoctor;
        string recordDetailsUri;
    }

    struct PatientFamilyMedicalRecord {
        uint256 medicalRecordId;
        uint256 principalPatientId;
        uint256 familyMemberId;
        uint256 duration;
        uint256 expiration;
        address approvedDoctor;
        string recordDetailsUri;
    }

    /**
     * State Variables
     */
    address private immutable SUPER_ADMIN;
    uint256 public hospitalCount;
    uint256 public doctorCount;
    uint256 public pharmacistCount;
    uint256 public patientCount;
    uint256 public systemAdminCount;

    mapping(address => bool) public systemAdmins;
    mapping(address => bool) public isDoctor;
    mapping(address => bool) public isPharmacist;
    mapping(address => bool) public isPatient;
    mapping(uint256 => Hospital) public hospitals;
    mapping(uint256 => Patient) public patients;
    mapping(address => uint256) public patientIds;
    mapping(address => uint256) public doctorIds;
    mapping(address => uint256) public pharmacistIds;
    mapping(address => uint256) public hospitalIds;
    mapping(uint256 => Doctor) public doctors;
    mapping(uint256 => Pharmacist) public pharmacists;
    mapping(uint256 => bool) public hospitalExists;
    mapping(uint256 => bool) public doctorExists;
    mapping(uint256 => bool) public pharmacistExists;
    mapping(uint256 => mapping(address => bool)) public isHospitalDoctor;
    mapping(uint256 => mapping(address => bool)) public isHospitalPharmacist;

    mapping(uint256 => mapping(uint256 => MedicalRecord))
        private patientMedicalRecords;

    mapping(uint256 => mapping(uint256 => mapping(address => bool)))
        public isPatientApprovedDoctors;
    mapping(uint256 => mapping(address => bool))
        public isApprovedByPatientToAddNewRecord;

    mapping(uint256 => mapping(uint256 => mapping(uint256 => mapping(address => bool))))
        public isPatientApprovedDoctorForFamilyMember;
    mapping(uint256 => mapping(uint256 => mapping(address => bool)))
        public isApprovedByPatientToAddNewRecordForFamilyMember;
    mapping(uint256 => mapping(uint256 => bool)) public isPatientFamilyMember;
    mapping(uint256 => mapping(uint256 => PatientFamilyMember))
        private patientFamilyMembers;
    mapping(uint256 => mapping(uint256 => mapping(uint256 => PatientFamilyMedicalRecord)))
        private patientFamilyMedicalRecord;

    /**
     * Events
     */
    event HospitalCreated(address indexed admin, uint256 indexed hospitalId);
    event HospitalApproved(uint256 indexed hospitalId);
    event HospitalRejected(uint256 indexed hospitalId);
    event AdminAdded(address indexed admin);
    event AdminRemoved(address indexed admin);
    event SystemAdminAdded(address indexed admin, uint256 indexed adminId);
    event SystemAdminRemoved(address indexed admin, uint256 indexed adminId);
    event DoctorAdded(address indexed doctor, uint256 indexed doctorId);
    event DoctorRejected(address indexed doctor, uint256 indexed doctorId);
    event HospitalAddedDoctor(
        address indexed doctor,
        uint256 indexed hospitalId
    );
    event HospitalRemovedDoctor(
        address indexed doctor,
        uint256 indexed hospitalId
    );

    event HospitalAddedPharmacist(
        address indexed pharmacist,
        uint256 indexed hospitalId
    );

    event HospitalRemovedPharmacist(
        address indexed pharmacist,
        uint256 indexed hospitalId
    );

    event PharmacistAdded(
        address indexed pharmacist,
        uint256 indexed pharmacistId
    );

    event MedicalRecordAdded(
        address indexed doctor,
        address indexed patient,
        uint256 indexed medicalRecordId
    );

    event FamilyMemberMedicalRecordAdded(
        address doctor,
        address indexed principalPatient,
        uint256 indexed familyMemberId,
        uint256 indexed medicalRecordId
    );

    event MedicalRecordAccessApproved(
        address indexed patient,
        address indexed approvedDoctor,
        uint256 indexed medicalRecordId
    );

    event WriteAccessGranted(address indexed doctor, uint256 indexed patientId);
    event WriteAccessRevoked(address indexed doctor, uint256 indexed patientId);

    event RecordAccessRevoked(
        address indexed patient,
        address indexed approvedDoctor,
        uint256 indexed medicalRecordId
    );

    event MedicalRecordAccessed(string indexed recordDetailsUri);

    event PatientAdded(address indexed patient, uint256 indexed patientId);
    event PatientFamilyMemberAdded(
        uint256 indexed principalPatientId,
        uint256 indexed patientId
    );

    /**
     * Modifiers
     */
    modifier onlySuperAdmin() {
        if (msg.sender != SUPER_ADMIN) {
            revert OnlyAdminAllowed();
        }
        _;
    }

    modifier onlySystemAdmin() {
        if (!systemAdmins[msg.sender]) {
            revert OnlySystemAdminAllowed();
        }
        _;
    }

    modifier onlyHospitalAdmin(uint256 _hospitalId) {
        if (hospitals[_hospitalId].admin != msg.sender) {
            revert Unauthorized();
        }
        _;
    }

    modifier onlyPatient(address _patientAddress) {
        if (!isPatient[_patientAddress]) {
            revert OnlyPatientAllowed();
        }
        _;
    }

    modifier onlyPrincipalPatient(uint256 _patientId) {
        if (patients[_patientId].walletAddress != msg.sender) {
            revert Unauthorized();
        }
        _;
    }

    modifier onlyApprovedHospitals(uint256 _hospitalId) {
        if (hospitals[_hospitalId].approvalStatus != approvalType.Approved) {
            revert HospitalNotApproved();
        }
        _;
    }

    modifier hospitalIdCompliance(uint256 _hospitalId) {
        if (_hospitalId > hospitalCount || _hospitalId == 0) {
            revert InvalidHospitalId();
        }
        _;
    }

    modifier patientIdCompliance(uint256 _patientId) {
        if (_patientId > patientCount || _patientId == 0) {
            revert InvalidPatientId();
        }

        _;
    }

    modifier recordIdCompliance(uint256 _recordId, uint256 _patientId) {
        if (
            _recordId > patients[_patientId].patientMedicalRecordCount ||
            _recordId == 0
        ) {
            revert InvalidMedicalRecordId();
        }
        _;
    }

    modifier doctorOrPharmacistCompliance(address _practitionerAddress) {
        if (_practitionerAddress == address(0)) {
            revert InvalidAddress();
        }

        require(
            isDoctor[_practitionerAddress] ||
                isPharmacist[_practitionerAddress],
            'invalid practitioner'
        );

        _;
    }

    modifier doctorCompliance(address _doctorAddress) {
        if (_doctorAddress == address(0)) {
            revert InvalidAddress();
        }

        require(isDoctor[_doctorAddress], 'invalid doctor');

        _;
    }

    modifier onlyPatientApprovedDoctor(
        uint256 _patientId,
        uint256 _recordId,
        address _doctorsAddress
    ) {
        if (!isPatientApprovedDoctors[_patientId][_recordId][_doctorsAddress]) {
            revert Unauthorized();
        }
        _;
    }

    modifier blankAddressCompliance(address _address) {
        require(_address != address(0), 'Invalid address');
        _;
    }

    modifier noDuplicatePractitioner(address _address) {
        require(
            !isDoctor[_address] || !isPharmacist[_address],
            'Duplicate Practitioner'
        );
        _;
    }

    constructor() {
        SUPER_ADMIN = msg.sender;
        systemAdmins[msg.sender] = true;
        systemAdminCount++;
    }

    receive() external payable {}

    /*
     * External Functions
     */
    function addSystemAdmin(address _admin) external onlySystemAdmin {
        require(_admin != address(0), 'Invalid address');
        systemAdmins[_admin] = true;
        systemAdminCount++;
        emit SystemAdminAdded(_admin, systemAdminCount);
    }

    function removeSystemAdmin(address _admin) external onlySystemAdmin {
        require(_admin != address(0), 'Invalid address');
        systemAdmins[_admin] = false;
        systemAdminCount--;
        emit SystemAdminRemoved(_admin, systemAdminCount + 1);
    }

    function createHospital() external {
        hospitalCount++;
        Hospital memory hospital = Hospital({
            hospitalId: hospitalCount,
            doctorsCount: 0,
            pharmacistsCount: 0,
            admin: msg.sender,
            approvalStatus: approvalType.Pending
        });
        hospitals[hospitalCount] = hospital;
        hospitalExists[hospitalCount] = true;
        hospitalIds[msg.sender] = hospitalCount;

        emit HospitalCreated(msg.sender, hospitalCount);
    }

    function approveHospital(uint256 _hospitalId) external onlySystemAdmin {
        if (_hospitalId > hospitalCount) {
            revert InvalidHospitalId();
        }
        hospitals[_hospitalId].approvalStatus = approvalType.Approved;
        emit HospitalApproved(_hospitalId);
    }

    function reassignHospitalAdmin(
        uint256 _hospitalId,
        address _admin
    )
        external
        hospitalIdCompliance(_hospitalId)
        onlyHospitalAdmin(_hospitalId)
    {
        if (_admin == address(0)) {
            revert InvalidAddress();
        }
        hospitals[_hospitalId].admin = _admin;
        emit AdminAdded(_admin);
    }

    function rejectHospital(uint256 _hospitalId) external onlySystemAdmin {
        if (_hospitalId > hospitalCount) {
            revert InvalidHospitalId();
        }
        hospitals[_hospitalId].approvalStatus = approvalType.Rejected;
        emit HospitalRejected(_hospitalId);
    }

    function createDoctor(
        address _doctorAddress
    )
        external
        blankAddressCompliance(_doctorAddress)
        noDuplicatePractitioner(_doctorAddress)
    {
        doctorCount++;

        Doctor memory doctor = Doctor({
            doctorId: doctorCount,
            doctor: _doctorAddress
        });

        doctorExists[doctorCount] = true;
        doctors[doctorCount] = doctor;
        isDoctor[_doctorAddress] = true;
        doctorIds[_doctorAddress] = doctorCount;
        emit DoctorAdded(_doctorAddress, doctorCount);
    }

    function addDoctorToHospital(
        address _doctorAddress,
        uint256 _hospitalId
    )
        external
        onlyHospitalAdmin(_hospitalId)
        hospitalIdCompliance(_hospitalId)
        blankAddressCompliance(_doctorAddress)
        doctorOrPharmacistCompliance(_doctorAddress)
    {
        hospitals[_hospitalId].doctorsCount++;
        isHospitalDoctor[_hospitalId][_doctorAddress] = true;

        emit HospitalAddedDoctor(_doctorAddress, _hospitalId);
    }

    function removeDoctorFromHospital(
        address _doctorAddress,
        uint256 _hospitalId
    )
        external
        onlyHospitalAdmin(_hospitalId)
        hospitalIdCompliance(_hospitalId)
        blankAddressCompliance(_doctorAddress)
        doctorOrPharmacistCompliance(_doctorAddress)
    {
        hospitals[_hospitalId].doctorsCount--;
        delete isHospitalDoctor[_hospitalId][_doctorAddress];
        emit HospitalRemovedDoctor(_doctorAddress, _hospitalId);
    }

    function createPharmacist(
        address _address
    )
        external
        blankAddressCompliance(_address)
        noDuplicatePractitioner(_address)
    {
        pharmacistCount++;

        Pharmacist memory pharmacist = Pharmacist({
            pharmacistId: pharmacistCount,
            pharmacist: _address
        });

        pharmacistExists[pharmacistCount] = true;
        pharmacists[pharmacistCount] = pharmacist;
        isPharmacist[_address] = true;

        pharmacistIds[_address] = pharmacistCount;
        emit PharmacistAdded(_address, pharmacistCount);
    }

    function addPharmacistToHospital(
        address _pharmacistAddress,
        uint256 _hospitalId
    )
        external
        onlyHospitalAdmin(_hospitalId)
        hospitalIdCompliance(_hospitalId)
        blankAddressCompliance(_pharmacistAddress)
        doctorOrPharmacistCompliance(_pharmacistAddress)
    {
        hospitals[_hospitalId].pharmacistsCount++;
        isHospitalPharmacist[_hospitalId][_pharmacistAddress] = true;

        emit HospitalAddedPharmacist(_pharmacistAddress, _hospitalId);
    }

    function removePharmacistFromHospital(
        address _pharmacistAddress,
        uint256 _hospitalId
    )
        external
        onlyHospitalAdmin(_hospitalId)
        hospitalIdCompliance(_hospitalId)
        blankAddressCompliance(_pharmacistAddress)
        doctorOrPharmacistCompliance(_pharmacistAddress)
    {
        hospitals[_hospitalId].pharmacistsCount--;
        delete isHospitalPharmacist[_hospitalId][_pharmacistAddress];

        emit HospitalRemovedPharmacist(_pharmacistAddress, _hospitalId);
    }

    function addPatient() external {
        address _walletAddress = msg.sender;
        require(!isPatient[_walletAddress], 'DuplicatePatientAddress');
        patientCount++;
        uint256 id = patientCount;
        Patient memory patient = Patient({
            patientId: id,
            patientMedicalRecordCount: 0,
            patientFamilyMemberCount: 0,
            walletAddress: _walletAddress
        });

        patients[id] = patient;
        isPatient[_walletAddress] = true;
        patientIds[_walletAddress] = id;

        emit PatientAdded(_walletAddress, id);
    }

    function addPatientFamilyMember(
        uint256 _principalPatientId
    )
        external
        onlyPatient(msg.sender)
        patientIdCompliance(_principalPatientId)
    {
        patients[_principalPatientId].patientFamilyMemberCount++;
        uint256 familyMemberId = patients[_principalPatientId]
            .patientFamilyMemberCount;

        isPatientFamilyMember[_principalPatientId][familyMemberId] = true;
        PatientFamilyMember memory familyMember = PatientFamilyMember({
            familyMemberId: familyMemberId,
            principalPatientId: _principalPatientId,
            familyMemberMedicalRecordCount: 0
        });

        patientFamilyMembers[_principalPatientId][
            familyMemberId
        ] = familyMember;
        emit PatientFamilyMemberAdded(_principalPatientId, familyMemberId);
    }

    function approveMedicalRecordAccess(
        address _practitionerAddress,
        uint256 _patientId,
        uint256 _recordId,
        uint256 _duration
    )
        external
        onlyPatient(msg.sender)
        patientIdCompliance(_patientId)
        doctorOrPharmacistCompliance(_practitionerAddress)
        recordIdCompliance(_patientId, _recordId)
    {
        require(
            patientMedicalRecords[_patientId][_recordId].patient == msg.sender,
            'not record owner'
        );
        MedicalRecord storage record = patientMedicalRecords[_patientId][
            _recordId
        ];

        require(
            record.approvedDoctor != _practitionerAddress,
            'access already granted to this practitioner'
        );
        isPatientApprovedDoctors[_patientId][_recordId][
            _practitionerAddress
        ] = true;

        record.approvedDoctor = _practitionerAddress;
        record.duration = _duration;
        record.expiration = block.timestamp + _duration;

        emit MedicalRecordAccessApproved(
            msg.sender,
            _practitionerAddress,
            _recordId
        );
    }

    function approveFamilyMemberMedicalRecordAccess(
        address _doctorAddress,
        uint256 _principalPatientId,
        uint256 _familyMemberId,
        uint256 _recordId,
        uint256 _duration
    )
        external
        onlyPatient(msg.sender)
        onlyPrincipalPatient(_principalPatientId)
        doctorOrPharmacistCompliance(_doctorAddress)
    {
        if (
            _familyMemberId >
            patients[_principalPatientId].patientFamilyMemberCount
        ) {
            revert InvalidFamilyMemberId();
        }

        require(
            _recordId <=
                patientFamilyMembers[_principalPatientId][_familyMemberId]
                    .familyMemberMedicalRecordCount,
            'invalid medical record id'
        );

        bool isDoctorApproved = isPatientApprovedDoctorForFamilyMember[
            _principalPatientId
        ][_familyMemberId][_recordId][_doctorAddress];
        PatientFamilyMedicalRecord storage record = patientFamilyMedicalRecord[
            _principalPatientId
        ][_familyMemberId][_recordId];

        require(
            !isDoctorApproved && record.approvedDoctor != _doctorAddress,
            'access already granted'
        );

        isPatientApprovedDoctorForFamilyMember[_principalPatientId][
            _familyMemberId
        ][_recordId][_doctorAddress] = true;

        record.approvedDoctor = _doctorAddress;
        record.duration = _duration;
        record.expiration = block.timestamp + _duration;

        emit MedicalRecordAccessApproved(msg.sender, _doctorAddress, _recordId);
    }

    function approveAccessToAddNewRecord(
        address _doctorAddress,
        uint256 _patientId
    )
        external
        onlyPatient(msg.sender)
        patientIdCompliance(_patientId)
        doctorOrPharmacistCompliance(_doctorAddress)
    {
        require(
            !isApprovedByPatientToAddNewRecord[_patientId][_doctorAddress],
            'access already granted'
        );

        isApprovedByPatientToAddNewRecord[_patientId][_doctorAddress] = true;
        emit WriteAccessGranted(_doctorAddress, _patientId);
    }

    function revokeAccessToAddNewRecord(
        address _doctorAddress,
        uint256 _patientId
    )
        external
        onlyPatient(msg.sender)
        patientIdCompliance(_patientId)
        doctorOrPharmacistCompliance(_doctorAddress)
    {
        if (!isApprovedByPatientToAddNewRecord[_patientId][_doctorAddress]) {
            revert AccessNotGranted();
        }

        isApprovedByPatientToAddNewRecord[_patientId][_doctorAddress] = false;
        emit WriteAccessRevoked(_doctorAddress, _patientId);
    }

    function revokeMedicalRecordAccess(
        uint256 _patientId,
        uint256 _recordId,
        address _doctorAddress
    )
        external
        onlyPatient(msg.sender)
        doctorCompliance(_doctorAddress)
        patientIdCompliance(_patientId)
        recordIdCompliance(_recordId, _patientId)
    {
        if (!patientHasRecords(_patientId)) {
            revert MedicalRecordNotFound();
        }
        if (
            isPatientApprovedDoctors[_patientId][_recordId][_doctorAddress] ==
            false
        ) {
            revert AccessToRecordNotGranted();
        }
        patientMedicalRecords[_patientId][_recordId].approvedDoctor = address(
            0
        );
        isPatientApprovedDoctors[_patientId][_recordId][_doctorAddress] = false;

        emit RecordAccessRevoked(msg.sender, _doctorAddress, _recordId);
    }

    function approveAccessToAddNewRecordForFamilyMember(
        address _doctorAddress,
        uint256 _patientId,
        uint256 _principalPatientId
    )
        external
        onlyPatient(msg.sender)
        onlyPrincipalPatient(_principalPatientId)
        doctorOrPharmacistCompliance(_doctorAddress)
    {
        require(
            !isApprovedByPatientToAddNewRecordForFamilyMember[_patientId][
                _principalPatientId
            ][_doctorAddress],
            'access already granted'
        );

        isApprovedByPatientToAddNewRecordForFamilyMember[_patientId][
            _principalPatientId
        ][_doctorAddress] = true;

        emit WriteAccessGranted(_doctorAddress, _patientId);
    }

    function revokeAccessToAddNewRecordForFamilyMember(
        address _doctorAddress,
        uint256 _patientId,
        uint256 _principalPatientId
    )
        external
        onlyPatient(msg.sender)
        onlyPrincipalPatient(_principalPatientId)
        doctorOrPharmacistCompliance(_doctorAddress)
    {
        if (
            !isApprovedByPatientToAddNewRecordForFamilyMember[_patientId][
                _principalPatientId
            ][_doctorAddress]
        ) {
            revert AccessNotGranted();
        }

        isApprovedByPatientToAddNewRecordForFamilyMember[_patientId][
            _principalPatientId
        ][_doctorAddress] = false;

        emit WriteAccessRevoked(_doctorAddress, _patientId);
    }

    function revokeFamilyMemberMedicalRecordAccess(
        address _doctorAddress,
        uint256 _recordId,
        uint256 _principalPatientId,
        uint256 _familyMemberId
    )
        external
        onlyPatient(msg.sender)
        onlyPrincipalPatient(_principalPatientId)
        doctorCompliance(_doctorAddress)
    {
        if (
            !patientFamilyMemberHasRecords(_principalPatientId, _familyMemberId)
        ) {
            revert MedicalRecordNotFound();
        }
        if (
            _familyMemberId >
            patients[_principalPatientId].patientFamilyMemberCount
        ) {
            revert InvalidFamilyMemberId();
        }

        if (
            _recordId >
            patientFamilyMembers[_principalPatientId][_familyMemberId]
                .familyMemberMedicalRecordCount
        ) {
            revert InvalidMedicalRecordId();
        }
        isPatientApprovedDoctorForFamilyMember[_principalPatientId][
            _familyMemberId
        ][_recordId][_doctorAddress] = false;
        patientFamilyMedicalRecord[_principalPatientId][_familyMemberId][
            _recordId
        ].approvedDoctor = address(0);

        emit RecordAccessRevoked(msg.sender, _doctorAddress, _recordId);
    }

    function addMedicalRecord(
        address _doctorAddress,
        address _patientAddress,
        uint256 _patientId,
        string memory _recordDetailsUri
    )
        external
        patientIdCompliance(_patientId)
        doctorCompliance(_doctorAddress)
    {
        if (bytes(_recordDetailsUri).length == 0) {
            revert InvalidMedicalRecordDetail();
        }

        if (!isApprovedByPatientToAddNewRecord[_patientId][_doctorAddress]) {
            revert AccessNotGranted();
        }
        patients[_patientId].patientMedicalRecordCount++;
        uint256 medicalRecordId = patients[_patientId]
            .patientMedicalRecordCount;

        MedicalRecord memory record = MedicalRecord({
            medicalRecordId: medicalRecordId,
            patientId: _patientId,
            duration: 0 seconds,
            expiration: 0 seconds,
            patient: _patientAddress,
            approvedDoctor: address(0),
            recordDetailsUri: _recordDetailsUri
        });
        patientMedicalRecords[_patientId][medicalRecordId] = record;

        isApprovedByPatientToAddNewRecord[_patientId][_doctorAddress] = false;
        emit MedicalRecordAdded(
            _doctorAddress,
            _patientAddress,
            medicalRecordId
        );
    }

    function addMedicalRecordForFamilyMember(
        address _doctorAddress,
        uint256 _principalPatientId,
        uint256 _familyMemberId,
        string memory _recordDetailsUri
    )
        external
        patientIdCompliance(_principalPatientId)
        doctorCompliance(_doctorAddress)
    {
        if (bytes(_recordDetailsUri).length == 0) {
            revert InvalidMedicalRecordDetail();
        }

        if (
            !isApprovedByPatientToAddNewRecordForFamilyMember[
                _principalPatientId
            ][_familyMemberId][_doctorAddress]
        ) {
            revert AccessNotGranted();
        }
        patientFamilyMembers[_principalPatientId][_familyMemberId]
            .familyMemberMedicalRecordCount++;
        uint256 medicalRecordId = patientFamilyMembers[_principalPatientId][
            _familyMemberId
        ].familyMemberMedicalRecordCount;
        PatientFamilyMedicalRecord memory record = PatientFamilyMedicalRecord({
            medicalRecordId: medicalRecordId,
            principalPatientId: _principalPatientId,
            familyMemberId: _familyMemberId,
            duration: 0 seconds,
            expiration: 0 seconds,
            approvedDoctor: address(0),
            recordDetailsUri: _recordDetailsUri
        });

        patientFamilyMedicalRecord[_principalPatientId][_familyMemberId][
            medicalRecordId
        ] = record;
        isApprovedByPatientToAddNewRecordForFamilyMember[_principalPatientId][
            _familyMemberId
        ][_doctorAddress] = false;

        emit FamilyMemberMedicalRecordAdded(
            _doctorAddress,
            patients[_principalPatientId].walletAddress,
            _familyMemberId,
            medicalRecordId
        );
    }

    /**
     * View Functions
     */

    function viewMedicalRecord(
        uint256 _recordId,
        uint256 _patientId,
        address _viewer
    )
        public
        view
        patientIdCompliance(_patientId)
        recordIdCompliance(_recordId, _patientId)
        returns (string memory _recordDetails)
    {
        if (_viewer == address(0)) {
            revert InvalidAddress();
        }

        require(patientHasRecords(_patientId), 'patient has no records');

        MedicalRecord memory record = patientMedicalRecords[_patientId][
            _recordId
        ];

        bool hasAccess = viewerHasAccessToMedicalRecord(
            _viewer,
            _patientId,
            _recordId
        );

        require(hasAccess, 'unauthorized');

        return record.recordDetailsUri;
    }

    function viewFamilyMemberMedicalRecord(
        uint256 _recordId,
        uint256 _principalPatientId,
        uint256 _familyMemberId,
        address _viewer
    )
        external
        view
        patientIdCompliance(_principalPatientId)
        returns (string memory _recordDetails)
    {
        if (_viewer == address(0)) {
            revert InvalidAddress();
        }

        if (
            _recordId >
            patientFamilyMembers[_principalPatientId][_familyMemberId]
                .familyMemberMedicalRecordCount
        ) {
            revert InvalidMedicalRecordId();
        }

        require(
            patientFamilyMemberHasRecords(_principalPatientId, _familyMemberId),
            'patient has no records'
        );
        PatientFamilyMedicalRecord memory record = patientFamilyMedicalRecord[
            _principalPatientId
        ][_familyMemberId][_recordId];

        bool hasAccess = viewerHasAccessToPatientFamilyMemberMedicalRecord(
            _viewer,
            _principalPatientId,
            _familyMemberId,
            _recordId
        );

        require(hasAccess, 'unauthorized');

        return record.recordDetailsUri;
    }

    function patientHasRecords(
        uint256 _patientId
    ) internal view returns (bool) {
        return patients[_patientId].patientMedicalRecordCount > 0;
    }

    function patientFamilyMemberHasRecords(
        uint256 _principalPatientId,
        uint256 _familyMemberId
    ) internal view returns (bool) {
        return
            patientFamilyMembers[_principalPatientId][_familyMemberId]
                .familyMemberMedicalRecordCount > 0;
    }

    function viewerHasAccessToMedicalRecord(
        address _viewer,
        uint256 _patientId,
        uint256 _recordId
    ) public view returns (bool) {
        MedicalRecord memory record = patientMedicalRecords[_patientId][
            _recordId
        ];
        bool accessValid = false;

        if (
            (isPatientApprovedDoctors[_patientId][_recordId][_viewer] &&
                record.approvedDoctor == _viewer &&
                block.timestamp < record.expiration) ||
            _viewer == record.patient
        ) {
            accessValid = true;
        }

        return accessValid;
    }

    function viewerHasAccessToPatientFamilyMemberMedicalRecord(
        address _viewer,
        uint256 _principalPatientId,
        uint256 _familyMemberId,
        uint256 _recordId
    ) public view returns (bool) {
        PatientFamilyMedicalRecord memory record = patientFamilyMedicalRecord[
            _principalPatientId
        ][_familyMemberId][_recordId];

        bool accessValid = false;
        address _principalPatient = patients[_principalPatientId].walletAddress;

        if (
            (isPatientApprovedDoctorForFamilyMember[_principalPatientId][
                _familyMemberId
            ][_recordId][_viewer] && block.timestamp < record.expiration) ||
            _viewer == _principalPatient
        ) {
            accessValid = true;
        }

        return accessValid;
    }
}
